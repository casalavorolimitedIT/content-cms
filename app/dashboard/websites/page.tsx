"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Link2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NewWebsite } from "@/app/custom/new-website";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { ActionModal } from "@/app/custom/action-modal";

interface Website {
  id: number;
  name: string;
  url: string;
  status: "connected" | "error" | "pending";
}

const linkedWebsites = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" /> Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleVisitWebsite = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWebsiteAdded = async () => {
    await fetchWebsites();
  };

  const fetchWebsites = async () => {
    const { data: websiteData, error } = await supabase
      .from("websites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching websites:", error);
      appToast.error("Failed to fetch websites", {
        description: error.message,
      });
      return;
    }
    setWebsites(websiteData as Website[]);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleDeleteClick = (id: number) => {
    setSelectedWebsiteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteWebsite = async () => {
    if (!selectedWebsiteId) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", selectedWebsiteId);

    if (error) {
      console.error("Error deleting website:", error);
      appToast.error("Failed to delete website", {
        description: error.message || "Please try again",
      });
      setIsDeleting(false);
      return;
    }
    setWebsites(websites.filter((website) => website.id !== selectedWebsiteId));

    appToast.success("Website deleted successfully", {
      description: "The website has been removed from your list.",
    });

    setDeleteOpen(false);
    setSelectedWebsiteId(null);
    setIsDeleting(false);
  };

  return (
    <div className="container px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Linked Websites</h1>
          <p className="text-muted-foreground mt-1">
            View websites connected to your application
          </p>
        </div>
        {process.env.NODE_ENV === "development" && (
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-primary cursor-pointer text-white hover:bg-primary/90"
          >
            Add website
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Websites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {websites.filter((w) => w.status === "connected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Websites List */}
      <Card>
        <CardContent className="pt-6">
          {websites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No websites linked yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setOpenModal(true)}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Link your first website
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{website.name}</h3>
                      {getStatusBadge(website.status)}
                    </div>
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {website.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVisitWebsite(website.url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    {process.env.NODE_ENV === "development" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(website.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewWebsite
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={handleWebsiteAdded}
      />

      <ActionModal
        preset="delete"
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteWebsite}
        isLoading={isDeleting}
        title="Delete Website"
        description={`Are you sure you want to delete this website? This action cannot be undone.`}
        confirmText="Delete"
        warningItems={[
          "The website will be permanently removed",
          "All associated data will be deleted",
        ]}
      />
    </div>
  );
};

export default linkedWebsites;
