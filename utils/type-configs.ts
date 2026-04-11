import { Calendar01Icon, Film01Icon, News01Icon } from "@hugeicons/core-free-icons";
import { Sparkle } from "lucide-react";

export const TYPE_CONFIG: any = {
  article: {
    icon: News01Icon,
    label: "Article",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    cls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  cinema: {
    icon: Film01Icon,
    label: "Cinema",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    cls: "bg-violet-50 text-violet-600 border-violet-100",
  },
  event: {
    icon: Calendar01Icon,
    label: "Event",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    cls: "bg-orange-50 text-orange-600 border-orange-100",
  },
  spa: {
    icon: Sparkle,
    label: "Spa",
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
    cls: "bg-pink-50 text-pink-600 border-pink-100",
  },
};

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function createMarkup(html: string) {
  return { __html: html };
}