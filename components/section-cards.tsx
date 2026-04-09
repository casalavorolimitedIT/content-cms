"use client";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { News01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { usePosts } from "@/contexts/postContext";

const colorSchemes = {
  0: {
    bg: "from-blue-50 to-blue-100/30",
    border: "hover:border-blue-200",
    icon: "bg-blue-500 text-white",
    pill: "bg-blue-500 text-white",
    trend: "text-blue-600",
  },
  1: {
    bg: "from-emerald-50 to-emerald-100/30",
    border: "hover:border-emerald-200",
    icon: "bg-emerald-500 text-white",
    pill: "bg-emerald-500 text-white",
    trend: "text-emerald-600",
  },
  2: {
    bg: "from-amber-50 to-amber-100/30",
    border: "hover:border-amber-200",
    icon: "bg-amber-500 text-white",
    pill: "bg-amber-500 text-white",
    trend: "text-amber-600",
  },
};

export function SectionCards() {
  const { posts } = usePosts();

  const totalPosts = posts.length;

  const activePosts = posts.filter((post) => {
    if (post.is_hidden) return false;
    if (post.status === "Now Showing" || post.status === "Ongoing") return true;
    if (post.status === "Live") return true;
    const hasFutureSchedule =
      post.originalData.scheduled_at &&
      new Date(post.originalData.scheduled_at) > new Date();
    if (hasFutureSchedule) return false;
    if (post.status === "Upcoming" || post.status === "Coming Soon")
      return false;
    if (post.status === "Scheduled") return false;
    return true;
  }).length;

  const scheduledPosts = posts.filter((post) => {
    if (post.is_hidden) return false;
    const hasFutureSchedule =
      post.originalData.scheduled_at &&
      new Date(post.originalData.scheduled_at) > new Date();
    if (hasFutureSchedule) return true;
    if (post.status === "Upcoming" || post.status === "Coming Soon")
      return true;
    if (post.status === "Scheduled") return true;
    return false;
  }).length;

  const statsConfig = [
    {
      label: "Total blog posts",
      value: totalPosts.toString(),
      detail: "Total number of written blog posts across all websites",
      pill: "All sites",
      icon: (
        <HugeiconsIcon icon={News01Icon} strokeWidth={1.5} className="size-5" />
      ),
    },
    {
      label: "Active blog posts",
      value: activePosts.toString(),
      detail: "Published and currently receiving traffic",
      pill: "Live",
      icon: (
        <HugeiconsIcon icon={News01Icon} strokeWidth={1.5} className="size-5" />
      ),
    },
    {
      label: "Scheduled blog posts",
      value: scheduledPosts.toString(),
      detail: "Awaiting scheduled date — not yet live",
      pill: "Pending",
      icon: (
        <HugeiconsIcon
          icon={Clock01Icon}
          strokeWidth={1.5}
          className="size-5"
        />
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Blog Analytics</h2>
        <p className="text-gray-500 mt-1">
          Overview of your content performance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {statsConfig.map((stat, index) => (
          <Card
            key={stat.label}
            className={`group relative overflow-hidden bg-linear-to-br ${colorSchemes[index as keyof typeof colorSchemes].bg} border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:${colorSchemes[index as keyof typeof colorSchemes].border}`}
          >
            <div className="relative z-10">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorSchemes[index as keyof typeof colorSchemes].icon} shadow-lg mb-5`}
              >
                {stat.icon}
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colorSchemes[index as keyof typeof colorSchemes].pill}`}
                >
                  {stat.pill}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200/50">
                {stat.detail}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
