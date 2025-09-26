"use client";
import PositionAnalytics from "@/components/dashboard/position-analytics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Application } from "@prisma/client";
import { Copy, Eye, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Type definitions
interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  voiceType?: string;
}

interface Position {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  userId: string;
  questions: Question[];
  applications: Application[];
  _count: {
    applications: number;
    questions: number;
  };
}

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [positionTitle, setPositionTitle] = useState("");

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/positions/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPosition(data);
          setPositionTitle(data.title);
        } else {
          console.error("Failed to fetch position");
        }
      } catch (error) {
        console.error("Error fetching position:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPosition();
    }
  }, [params.id]);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/public/${params.id}`;
    navigator.clipboard.writeText(shareUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (!position) {
    return <div>Position not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            ←
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{position.title}</h1>
            <p className="text-gray-600">Hiring</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Share Link
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <div className="space-y-6">
            {/* Position Title Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Position Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input value={positionTitle} onChange={e => setPositionTitle(e.target.value)} className="w-full" placeholder="Enter position title" />
              </CardContent>
            </Card>

            {/* Interview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Introduction</h3>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      !
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-20">
                      <AvatarImage src="/placeholder-woman.jpg" />
                      <AvatarFallback className="bg-gray-200">👩</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="introduction">Introduction</Label>
                      <Textarea id="introduction" className="mt-2" placeholder="Enter introduction text..." rows={3} />
                    </div>
                  </div>
                </div>

                {/* Question 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Question 1</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        !
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-20">
                      <AvatarImage src="/placeholder-man.jpg" />
                      <AvatarFallback className="bg-gray-200">👨</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="question1-title">Motivation</Label>
                        <Input id="question1-title" className="mt-2" defaultValue="Motivation" />
                      </div>
                      <div>
                        <Textarea
                          className="mt-2"
                          placeholder="It is very important to us that the person that fills this position is excited about working here. Why do you think ABC Company would be a good fit for you?"
                          rows={4}
                          defaultValue="It is very important to us that the person that fills this position is excited about working here. Why do you think ABC Company would be a good fit for you?"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Question 2</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        !
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="question2-title">Title</Label>
                        <Input id="question2-title" className="mt-2" placeholder="Question title" />
                      </div>
                      <div>
                        <Label htmlFor="question2-content">Full question</Label>
                        <Textarea id="question2-content" className="mt-2" placeholder="Enter your question here..." rows={4} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farewell Message */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Farewell Message</h3>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      !
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-20">
                      <AvatarImage src="/placeholder-woman.jpg" />
                      <AvatarFallback className="bg-gray-200">👩</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="farewell">Farewell message script</Label>
                      <Textarea id="farewell" className="mt-2" placeholder="Enter farewell message..." rows={3} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Introduction
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Farewell Message
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <PositionAnalytics positionId={params.id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
