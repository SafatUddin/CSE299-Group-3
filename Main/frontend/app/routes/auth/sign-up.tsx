import { useForm } from "react-hook-form";
import {z} from "zod";
import { Input } from "@/components/ui/input";
import { signInSchema, signUpSchema } from '@/lib/schema';
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { route } from "@react-router/dev/routes";
import { useEffect } from "react";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
    const navigate = useNavigate();
    const form = useForm<SignupFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            confirmPassword: "",
        },
    });

    const {mutate, isPending} = useSignUpMutation();

    // Prevent back navigation and redirect to home
    useEffect(() => {
        // Push current state to prevent back
        window.history.pushState(null, "", window.location.href);
        
        const handlePopState = () => {
            // Redirect to home when back button is pressed
            navigate("/", { replace: true });
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [navigate]);

    const handleOnSubmit = (values: SignupFormData) => {
      mutate(values, {
          onSuccess: () => {
          toast.success("Email verification Required", {
            description: "Please check your email for verification link. If you don't see it, please check your spam folder.",
          });
          form.reset();
          navigate("/sign-in"); // Redirect to sign-in page after successful sign-up
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          console.log(error);
          toast.error(errorMessage);
        },
      });
    };

    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="text-center mb-5">
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Create an account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form 
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name = "email"
                    render ={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name = "name"
                    render ={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="John Doe" 
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name = "password"
                    render ={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="********" 
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name = "confirmPassword"
                    render ={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="********" 
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing Up..." : "Sign Up"}
                  </Button>
                </form>
              </Form>
              <CardFooter className="flex item-center justify-center mt-6">
                <div className="flex item-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account? <Link to="/sign-in">Sign In</Link>
                  </p>
                </div>
              </CardFooter>
            </CardContent>
        </Card>
    </div>
  );
};

export default SignUp;