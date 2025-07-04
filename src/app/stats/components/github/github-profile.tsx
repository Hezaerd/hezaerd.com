"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Github,
  MapPin,
  Building,
  Globe,
  Twitter,
  ExternalLink
} from "lucide-react";

import type { GitHubProfile } from "@/interfaces/github";

interface GitHubProfileProps {
  profile: GitHubProfile;
}

export default function GitHubProfile({ profile }: GitHubProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
          <AvatarFallback>
            <Github className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <span className="text-sm text-muted-foreground">@{profile.username}</span>
          </div>

          {profile.bio && (
            <p className="text-muted-foreground mb-4">{profile.bio}</p>
          )}

          <div className="space-y-2 mb-4">
            {profile.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile.company}</span>
              </div>
            )}

            {profile.blog && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  {profile.blog}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {profile.twitter_username && (
              <div className="flex items-center gap-2 text-sm">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`https://twitter.com/${profile.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  @{profile.twitter_username}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Member since {formatDate(profile.created_at)}</span>
            <span>•</span>
            <span>Last updated {formatDate(profile.updated_at)}</span>
          </div>
        </div>
      </div>

      <motion.div
        className="mt-4 pt-4 border-t"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          asChild
          className="w-full"
          variant="outline"
        >
          <a
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            View Profile on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </motion.div>
    </Card>
  );
}