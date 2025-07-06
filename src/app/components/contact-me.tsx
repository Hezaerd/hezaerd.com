"use client";

import { startTransition, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SendHorizontal } from "lucide-react";
import { ContactFormSchema } from "@/schemas/contact-form";
import { sendEmail } from "@/lib/mail";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      fullname: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof ContactFormSchema>) {
    setIsLoading(true);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const result = await sendEmail(formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your message has been sent successfully!",
        });
        form.reset();
      }
      setIsLoading(false);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-400"
                  />
                </FormControl>
                <FormDescription className="text-neutral-400">
                  Enter your full name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="john.doe@example.com"
                    {...field}
                    className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-400"
                  />
                </FormControl>
                <FormDescription className="text-neutral-400">
                  Enter your email address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the subject of your message"
                  {...field}
                  className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-400"
                />
              </FormControl>
              <FormDescription className="text-neutral-400">
                Briefly describe the purpose of your message.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Message</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Type your message here"
                    className="min-h-[150px] border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-400"
                    {...field}
                  />
                  <div className="absolute bottom-2 right-2 text-sm text-neutral-400">
                    {field.value.length}/500
                  </div>
                </div>
              </FormControl>
              <FormDescription className="text-neutral-400">
                Provide details about your inquiry or message.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="outline"
          className="relative z-10 flex items-center gap-2 border-r text-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <SendHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export function ContactMe() {
  return (
    <div id="contact" className="py-10">
      <div>
        <h2 className="mb-8 text-3xl font-bold text-white">Get in Touch</h2>
        <ContactForm />
      </div>
    </div>
  );
}
