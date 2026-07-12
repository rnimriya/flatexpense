"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ApartmentSettings } from "@/components/dashboard/apartment-settings";
import { Home } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <UserProfile 
          appearance={{
            elements: {
              card: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl w-full max-w-full',
              navbar: 'hidden sm:flex', // Keep navbar visible on tablet+
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              profileSectionTitleText: 'text-foreground font-semibold',
              profileSectionContent: 'border-white/10',
              profileSectionPrimaryButton: 'text-primary hover:text-primary/90',
              accordionTriggerButton: 'text-foreground hover:bg-white/5',
              breadcrumbsItem: 'text-muted-foreground',
              breadcrumbsItemDivider: 'text-muted-foreground',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-white/5 border-white/10 text-foreground focus:ring-primary',
              avatarImageActionsUpload: 'text-primary',
              userPreviewMainIdentifier: 'text-foreground',
              userPreviewSecondaryIdentifier: 'text-muted-foreground',
              badge: 'bg-primary/20 text-primary',
              scrollBox: 'bg-transparent',
              navbarButton: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              pageScrollBox: 'bg-transparent',
            }
          }}
        >
          <UserProfile.Page label="Apartment" labelIcon={<Home className="w-4 h-4" />} url="apartment">
            <ApartmentSettings />
          </UserProfile.Page>
        </UserProfile>
      </motion.div>
    </div>
  );
}
