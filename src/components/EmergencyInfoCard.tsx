
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, EmergencyContact } from '@/lib/api';
import { AlertCircle, Phone } from 'lucide-react';

interface EmergencyInfoCardProps {
  user: User;
  contacts: EmergencyContact[];
  minimal?: boolean;
}

const EmergencyInfoCard: React.FC<EmergencyInfoCardProps> = ({
  user,
  contacts,
  minimal = false,
}) => {
  return (
    <Card className={minimal ? "border-red-200 bg-red-50" : "emergency-card"}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <CardTitle className="text-lg text-red-700">Emergency Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Personal Info</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm">{user.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Blood Type</p>
                <p className="text-sm font-bold">{user.bloodType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Height / Weight</p>
                <p className="text-sm">{user.height} cm / {user.weight} kg</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Allergies</h3>
            <div className="flex flex-wrap gap-1">
              {user.allergies.length > 0 ? (
                user.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 hover:bg-red-200">
                    {allergy}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No known allergies</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Chronic Conditions</h3>
            <div className="flex flex-wrap gap-1">
              {user.chronicConditions.length > 0 ? (
                user.chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-100 hover:bg-yellow-200">
                    {condition}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No chronic conditions</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Medications</h3>
            <div className="flex flex-wrap gap-1">
              {user.medications.length > 0 ? (
                user.medications.map((medication, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 hover:bg-blue-200">
                    {medication}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No current medications</p>
              )}
            </div>
          </div>

          {!minimal && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">Emergency Contacts</h3>
              {contacts.length > 0 ? (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="rounded-md border border-red-200 bg-white p-2">
                      <p className="font-medium">{contact.name} ({contact.relationship})</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${contact.phoneNumber}`} className="text-blue-600 hover:underline">
                          {contact.phoneNumber}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No emergency contacts added</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyInfoCard;
