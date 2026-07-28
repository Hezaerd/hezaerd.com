export type ClientFeature = "insights";

export type SiteHealthStatus = "up" | "degraded" | "down" | "unknown";

export type LinkedSite = {
  githubRepo: string;
  defaultBranch: string;
  productionUrl: string;
};

export type SiteGitCommit = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  committedAt: number;
  url: string;
};

export type SiteSnapshot = {
  linkedSite: LinkedSite;
  health: {
    status: SiteHealthStatus;
    latencyMs?: number;
    httpStatus?: number;
    checkedAt: number;
    consecutiveFailures: number;
  };
  git?: {
    branch: string;
    commits: SiteGitCommit[];
    syncedAt: number;
  };
  deploy?: {
    status: "success" | "failure" | "in_progress";
    commitSha?: string;
    previewUrl?: string;
    finishedAt: number;
    reportedAt: number;
  };
  hasActiveDeployToken: boolean;
};

export type NeedsAttentionKind = "invoice" | "file" | "notification" | "feature";

export type NeedsAttentionArea = "invoices" | "files" | "insights";

export type NeedsAttentionItem = {
  id: string;
  title: string;
  description: string;
  clientId: string;
  area: NeedsAttentionArea;
  kind: NeedsAttentionKind;
};

/** Client view for Portal UI — `id` is the public slug used in routes. */
export type PortalClient = {
  id: string;
  name: string;
  contactEmail: string;
  features: Record<ClientFeature, boolean>;
  linkedSite?: LinkedSite;
  fileSettings?: {
    defaultMaxFileSizeMb: number;
    uploadPresignTtlHours: number;
    downloadPresignTtlMinutes: number;
  };
};

export function hasLinkedSite(client: Pick<PortalClient, "linkedSite">): boolean {
  return Boolean(
    client.linkedSite?.githubRepo &&
      client.linkedSite.defaultBranch &&
      client.linkedSite.productionUrl,
  );
}

export type PracticeCockpitStats = {
  openInvoiceTotal: number;
  paidThisMonth: number;
  clientsWaiting: number;
  activeClients: number;
};

export type InvoiceStatus = "draft" | "open" | "paid" | "cancelled";

export type PaymentMethod = "stripe" | "bank_wire";

export type PortalInvoicePayment = {
  method: PaymentMethod;
  paidAt: number;
  stripeSessionId?: string;
  transferRef?: string;
};

/** Invoice row from Convex — use `_id` as the stable key in UI. */
export type PortalInvoice = {
  _id: string;
  number: number;
  label: string;
  amountCents: number;
  currency: "eur";
  status: InvoiceStatus;
  dueDate?: number;
  openedAt?: number;
  payment?: PortalInvoicePayment;
  clientSlug?: string;
  clientName?: string;
};

export function toPortalClient(client: {
  slug: string;
  name: string;
  contactEmail: string;
  features: Record<ClientFeature, boolean>;
  linkedSite?: LinkedSite;
  fileSettings?: {
    defaultMaxFileSizeMb: number;
    uploadPresignTtlHours: number;
    downloadPresignTtlMinutes: number;
  };
}): PortalClient {
  return {
    id: client.slug,
    name: client.name,
    contactEmail: client.contactEmail,
    features: client.features,
    linkedSite: client.linkedSite,
    fileSettings: client.fileSettings,
  };
}

export type FileRequestSlot = {
  _id: string;
  label: string;
  sortOrder: number;
  allowedExtensions: string[];
  file?: {
    fileName: string;
    contentType: string;
    sizeBytes: number;
    uploadedAt: number;
    replacedAt?: number;
    previousFileName?: string;
  };
};

export type FileRequestEntry = {
  request: {
    _id: string;
    title: string;
    instructions?: string;
    maxFileSizeMb: number;
    status: "active" | "cancelled";
  };
  slots: FileRequestSlot[];
  pendingCount: number;
  isComplete: boolean;
};

const DEFAULT_FILE_SETTINGS = {
  defaultMaxFileSizeMb: 100,
  uploadPresignTtlHours: 24,
  downloadPresignTtlMinutes: 15,
} as const;

export function resolvePortalFileSettings(client: PortalClient) {
  return {
    defaultMaxFileSizeMb:
      client.fileSettings?.defaultMaxFileSizeMb ?? DEFAULT_FILE_SETTINGS.defaultMaxFileSizeMb,
    uploadPresignTtlHours:
      client.fileSettings?.uploadPresignTtlHours ?? DEFAULT_FILE_SETTINGS.uploadPresignTtlHours,
    downloadPresignTtlMinutes:
      client.fileSettings?.downloadPresignTtlMinutes ??
      DEFAULT_FILE_SETTINGS.downloadPresignTtlMinutes,
  };
}
