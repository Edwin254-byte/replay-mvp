"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApplicantInfoPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, name: name.trim(), email: email.trim() }),
      });

      if (response.ok) {
        const { applicationId } = await response.json();
        toast.success("Application created successfully!");
        router.push(`/public/${publicId}/start/${applicationId}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create application");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Start Your Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" disabled={loading || !name.trim() || !email.trim()} className="w-full">
              {loading ? "Creating Application..." : "Start Interview"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
