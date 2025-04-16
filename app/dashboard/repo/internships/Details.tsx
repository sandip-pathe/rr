"use client";

import { Button } from "@/components/ui/button";
import CustomModal from "@/components/ModalWrapper";

interface InternshipDetailsModalProps {
  onClose: () => void;
  internship: {
    description: string;
    requirements: string;
    deadline: string;
    contactEmail?: string;
    applicationProcess?: string;
  };
}

const InternshipDetailsModal = ({
  onClose,
  internship,
}: InternshipDetailsModalProps) => {
  return (
    <div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Full Description</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {internship.description}
          </p>
        </div>

        <div>
          <h3 className="font-medium">Requirements</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {internship.requirements}
          </p>
        </div>

        <div>
          <h3 className="font-medium">Deadline</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {internship.deadline}
          </p>
        </div>

        {internship.contactEmail && (
          <div>
            <h3 className="font-medium">Contact</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {internship.contactEmail}
            </p>
          </div>
        )}

        {internship.applicationProcess && (
          <div>
            <h3 className="font-medium">Application Process</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {internship.applicationProcess}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailsModal;
