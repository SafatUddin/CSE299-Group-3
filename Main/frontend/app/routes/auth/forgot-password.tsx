import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { resetPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const {mutate: resetPassword, isPending} = useResetPasswordMutation();

    const form = useForm<ResetPasswordFormData> ({
      resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
        email: "",
        newPassword: "",
        confirmPassword: "",
      },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
      resetPassword(data, {
        onSuccess: () => {
          toast.success("Password reset successfully");
          
          // Clear localStorage to remove any old tokens
          localStorage.clear();
          
          form.reset();
          navigate("/sign-in");
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message;
          console.log(error);
          toast.error(errorMessage);
        }
      });
  };

  return (
          <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">Enter your email and new password</p>
          </div>

          <Card>
            <CardHeader>
              <Link to="/sign-in" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your email" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="newPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter new password" type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Confirm new password" type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isPending} >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default ForgotPassword