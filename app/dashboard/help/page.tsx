import { faqs } from "@/app/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const helpPage = () => {

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions below
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {faq.answer}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10 pt-6 border-t">
        <p className="text-muted-foreground">
          Still need help?
          <a
            href="mailto:preciousopia7@gmail.com"
            className="text-primary hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
};

export default helpPage;
