"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clipboard,
  Check,
  FileText,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { selectNdaClauses } from "@/ai/flows/template-selection-tool";
import { generateNdaText } from "@/lib/nda-template";

const formSchema = z.object({
  disclosingParty: z.string().min(1, "Disclosing party name is required."),
  receivingParty: z.string().min(1, "Receiving party name is required."),
  effectiveDate: z.date({
    required_error: "An effective date is required.",
  }),
  conversationContext: z
    .string()
    .min(10, "Please provide some context for better clause selection.")
    .max(500, "Context should be less than 500 characters."),
});

export default function Home() {
  const [ndaText, setNdaText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disclosingParty: "",
      receivingParty: "",
      conversationContext: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setNdaText("");
    try {
      const { selectedClauses } = await selectNdaClauses({
        conversationContext: values.conversationContext,
      });
      const generatedText = generateNdaText(values, selectedClauses);
      setNdaText(generatedText);
    } catch (error) {
      console.error("Failed to generate NDA:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating the NDA. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopy = () => {
    if (!ndaText) return;
    navigator.clipboard.writeText(ndaText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">NDA Now</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Generate a simple non-disclosure agreement in seconds.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>1. Enter Details</CardTitle>
            <CardDescription>
              Provide the necessary information to create the NDA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="disclosingParty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disclosing Party Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="receivingParty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receiving Party Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conversationContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversation Context</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe the topics discussed, e.g., 'Discussed a new mobile app idea and its intellectual property'."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        AI will use this to select relevant clauses.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isGenerating ? "Generating..." : "Generate NDA"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-lg">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>2. Review & Copy</CardTitle>
              <CardDescription>
                Your generated NDA will appear below.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!ndaText || isGenerating}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              <span className="sr-only">Copy to Clipboard</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full rounded-md border bg-secondary/30 p-4">
              {isGenerating ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="pt-4 space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                   <div className="pt-4 space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : ndaText ? (
                <pre className="whitespace-pre-wrap font-body text-sm">
                  {ndaText}
                </pre>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Your NDA will be generated here.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
