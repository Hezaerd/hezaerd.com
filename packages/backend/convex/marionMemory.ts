// @ts-nocheck — Marion memory/RAG; Convex validator depth exceeds tsc budget.
import { embed, generateText } from "ai";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { assertMarionServiceSecret } from "./lib/marion/auth";
import { marionEmbeddingModel, marionSummarizeModel } from "./lib/marion/gateway";
import { MARION_RAG_NAMESPACE, marionRag } from "./lib/marion/rag";

const serviceSecretArg = { serviceSecret: v.string() };

const messageRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system"),
);

function authArgs(args: { serviceSecret: string }) {
  assertMarionServiceSecret(args.serviceSecret);
}

async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: marionEmbeddingModel(),
    value: text,
  });
  return embedding;
}

export const searchMemory = action({
  args: { ...serviceSecretArg, query: v.string(), limit: v.optional(v.number()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const { text, entries } = await marionRag.search(ctx, {
      namespace: MARION_RAG_NAMESPACE,
      query: args.query,
      limit: args.limit ?? 8,
      vectorScoreThreshold: 0.35,
    });
    return { text, entryCount: entries.length };
  },
});

export const saveMemory = action({
  args: {
    ...serviceSecretArg,
    text: v.string(),
    key: v.optional(v.string()),
    importance: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const trimmed = args.text.trim();
    if (!trimmed) {
      throw new Error("Texte vide");
    }
    const { entryId } = await marionRag.add(ctx, {
      namespace: MARION_RAG_NAMESPACE,
      text: trimmed,
      key: args.key,
      importance: args.importance ?? 0.7,
    });
    return { entryId: String(entryId) };
  },
});

export const searchThreads = action({
  args: {
    ...serviceSecretArg,
    query: v.string(),
    limit: v.optional(v.number()),
    threadId: v.optional(v.id("colleagueThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const limit = args.limit ?? 10;
    const queryEmbedding = await embedText(args.query);

    const vectorResults = args.threadId
      ? await ctx.vectorSearch("colleagueMessages", "by_embedding", {
          vector: queryEmbedding,
          limit,
          filter: (q) => q.eq("threadId", args.threadId!),
        })
      : await ctx.vectorSearch("colleagueMessages", "by_embedding", {
          vector: queryEmbedding,
          limit,
        });

    const textResults = await ctx.runQuery(internal.marionMemory.textSearchQuery, {
      query: args.query,
      limit,
      threadId: args.threadId,
    });

    type Hit = {
      messageId: Id<"colleagueMessages">;
      threadId: Id<"colleagueThreads">;
      role: "user" | "assistant" | "system";
      content: string;
      score: number;
      source: "vector" | "text";
    };

    const byId = new Map<string, Hit>();

    for (const hit of vectorResults) {
      const message = await ctx.runQuery(internal.marionMemory.getMessageQuery, {
        messageId: hit._id,
      });
      if (!message) continue;
      byId.set(String(hit._id), {
        messageId: hit._id,
        threadId: message.threadId,
        role: message.role,
        content: message.content,
        score: hit._score,
        source: "vector",
      });
    }

    for (const message of textResults) {
      const existing = byId.get(String(message._id));
      if (existing) {
        existing.score = Math.max(existing.score, 0.6);
        continue;
      }
      byId.set(String(message._id), {
        messageId: message._id,
        threadId: message.threadId,
        role: message.role,
        content: message.content,
        score: 0.55,
        source: "text",
      });
    }

    return [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit);
  },
});

export const textSearchQuery = internalQuery({
  args: {
    query: v.string(),
    limit: v.number(),
    threadId: v.optional(v.id("colleagueThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (args.threadId) {
      return ctx.db
        .query("colleagueMessages")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.query).eq("threadId", args.threadId!),
        )
        .take(args.limit);
    }
    return ctx.db
      .query("colleagueMessages")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(args.limit);
  },
});

export const getMessageQuery = internalQuery({
  args: { messageId: v.id("colleagueMessages") },
  returns: v.any(),
  handler: async (ctx, args) => ctx.db.get("colleagueMessages", args.messageId),
});

export const appendThreadMessage = action({
  args: {
    ...serviceSecretArg,
    discordUserId: v.string(),
    eveSessionId: v.optional(v.string()),
    role: messageRoleValidator,
    content: v.string(),
    discordMessageId: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const embedding = await embedText(args.content);
    return ctx.runMutation(internal.marionMemory.appendMessageMutation, {
      discordUserId: args.discordUserId,
      eveSessionId: args.eveSessionId,
      role: args.role,
      content: args.content,
      discordMessageId: args.discordMessageId,
      embedding,
    });
  },
});

export const appendMessageMutation = internalMutation({
  args: {
    discordUserId: v.string(),
    eveSessionId: v.optional(v.string()),
    role: messageRoleValidator,
    content: v.string(),
    discordMessageId: v.optional(v.string()),
    embedding: v.array(v.float64()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const now = Date.now();
    let thread = args.eveSessionId
      ? await ctx.db
          .query("colleagueThreads")
          .withIndex("by_eveSessionId", (q) => q.eq("eveSessionId", args.eveSessionId))
          .unique()
      : null;

    if (!thread) {
      const recent = await ctx.db
        .query("colleagueThreads")
        .withIndex("by_discordUserId", (q) => q.eq("discordUserId", args.discordUserId))
        .order("desc")
        .take(1);
      const candidate = recent[0];
      if (candidate && now - candidate.lastMessageAt < 30 * 60 * 1000) {
        thread = candidate;
      }
    }

    let threadId: Id<"colleagueThreads">;
    if (thread) {
      threadId = thread._id;
      await ctx.db.patch(threadId, {
        lastMessageAt: now,
        eveSessionId: args.eveSessionId ?? thread.eveSessionId,
      });
    } else {
      threadId = await ctx.db.insert("colleagueThreads", {
        discordUserId: args.discordUserId,
        eveSessionId: args.eveSessionId,
        lastMessageAt: now,
      });
    }

    const messageId = await ctx.db.insert("colleagueMessages", {
      threadId,
      role: args.role,
      content: args.content,
      discordMessageId: args.discordMessageId,
      eveSessionId: args.eveSessionId,
      embedding: args.embedding,
    });

    return { threadId, messageId };
  },
});

export const summarizeStaleThreads = internalAction({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    const threads = await ctx.runQuery(internal.marionMemory.staleThreadsQuery, { cutoff });
    let summarized = 0;

    for (const thread of threads) {
      const messages = await ctx.runQuery(internal.marionMemory.threadMessagesQuery, {
        threadId: thread._id,
      });
      if (messages.length === 0) continue;

      const transcript = messages
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join("\n")
        .slice(0, 12_000);

      const { text: summary } = await generateText({
        model: marionSummarizeModel(),
        prompt: [
          "Résume cette conversation operator Portal en faits stables à retenir.",
          "Format: puces courtes, pas de filler, vocabulaire Desk Portal.",
          "Ignore les salutations et le bavardage.",
          "",
          transcript,
        ].join("\n"),
      });

      const trimmed = summary.trim();
      if (trimmed) {
        await marionRag.add(ctx, {
          namespace: MARION_RAG_NAMESPACE,
          text: trimmed,
          key: `thread-${thread._id}`,
          importance: 0.6,
        });
      }

      await ctx.runMutation(internal.marionMemory.markThreadSummarized, {
        threadId: thread._id,
      });
      summarized += 1;
    }

    return { summarized };
  },
});

export const staleThreadsQuery = internalQuery({
  args: { cutoff: v.number() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("colleagueThreads")
      .withIndex("by_lastMessageAt")
      .order("asc")
      .collect();

    return threads.filter(
      (thread) => thread.lastMessageAt <= args.cutoff && thread.summarizedAt === undefined,
    );
  },
});

export const threadMessagesQuery = internalQuery({
  args: { threadId: v.id("colleagueThreads") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return ctx.db
      .query("colleagueMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

export const markThreadSummarized = internalMutation({
  args: { threadId: v.id("colleagueThreads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, { summarizedAt: Date.now() });
    return null;
  },
});

export const tryRecordProactivePing = action({
  args: { ...serviceSecretArg, dayKey: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runMutation(internal.marionRead.recordProactivePing, { dayKey: args.dayKey });
  },
});

export const recordDigest = action({
  args: serviceSecretArg,
  returns: v.null(),
  handler: async (ctx, args) => {
    authArgs(args);
    await ctx.runMutation(internal.marionRead.recordDigestSent, { at: Date.now() });
    return null;
  },
});

export const getOperatorDeliveryTarget = action({
  args: serviceSecretArg,
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const state = await ctx.runQuery(internal.marionMemory.operatorStateQuery, {});
    if (!state?.dmChannelId) {
      return null;
    }
    return { dmChannelId: state.dmChannelId };
  },
});

export const operatorStateQuery = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return ctx.db
      .query("marionOperatorState")
      .withIndex("by_key", (q) => q.eq("key", "operator"))
      .unique();
  },
});
