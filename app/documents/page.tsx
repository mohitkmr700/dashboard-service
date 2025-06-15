'use client';

import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Trash2 } from "lucide-react";

const documents = [
  {
    id: 1,
    name: "Project Proposal.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2024-02-20",
  },
  {
    id: 2,
    name: "Meeting Notes.docx",
    type: "DOCX",
    size: "1.2 MB",
    lastModified: "2024-02-19",
  },
  {
    id: 3,
    name: "Budget 2024.xlsx",
    type: "XLSX",
    size: "3.1 MB",
    lastModified: "2024-02-18",
  },
];

export default function DocumentsPage() {
  return (
    <PageContainer 
      title="Documents"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-foreground">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.size} • Modified {doc.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
} 