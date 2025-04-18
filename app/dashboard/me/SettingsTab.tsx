import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface UniversitySettings {
  notifications: boolean;
  privacy: "public" | "private" | "university-only";
  theme: "light" | "dark" | "system";
}

interface SettingsTabProps {
  email: string;
  universitySettings?: UniversitySettings;
}

export const SettingsTab = ({
  email,
  universitySettings = {
    notifications: true,
    privacy: "public",
    theme: "system",
  },
}: SettingsTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-[#252525] border-0">
          <CardHeader>
            <CardTitle>University Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Privacy Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Profile Visibility</p>
                      <p className="text-sm text-gray-400">
                        Control who can see your profile
                      </p>
                    </div>
                    <select
                      defaultValue={universitySettings.privacy}
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="university-only">University Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Research Visibility</p>
                      <p className="text-sm text-gray-400">
                        Control who can see your research works
                      </p>
                    </div>
                    <select
                      defaultValue={universitySettings.privacy}
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="university-only">University Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="font-medium mb-3">Notification Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      defaultChecked={universitySettings.notifications}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                    />
                    <label htmlFor="emailNotifications">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="researchUpdates"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                    />
                    <label htmlFor="researchUpdates">Research Updates</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="collaborationRequests"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                    />
                    <label htmlFor="collaborationRequests">
                      Collaboration Requests
                    </label>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="font-medium mb-3">Appearance</h3>
                <div className="flex gap-4">
                  <button
                    disabled
                    className={`p-2 rounded-md border disabled:opacity-50 ${
                      universitySettings.theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-white/10"
                    }`}
                  >
                    Light
                  </button>
                  <button
                    className={`p-2 rounded-md border ${
                      universitySettings.theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-white/10"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    className={`p-2 rounded-md border ${
                      universitySettings.theme === "system"
                        ? "border-primary bg-primary/10"
                        : "border-white/10"
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Account Security */}
        <Card className="bg-[#252525] border-0">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Email Address</p>
                <div className="flex items-center justify-between">
                  <p>{email}</p>
                  <Button variant="ghost" size="sm">
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Password</p>
                <div className="flex items-center justify-between">
                  <p>••••••••</p>
                  <Button variant="ghost" size="sm">
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Two-Factor Authentication
                </p>
                <div className="flex items-center justify-between">
                  <p>Not enabled</p>
                  <Button variant="ghost" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#252525] border-0 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Deactivate Account</p>
                <p className="text-sm text-gray-400 mb-2">
                  Temporarily deactivate your account
                </p>
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                >
                  Deactivate
                </Button>
              </div>
              <Separator className="bg-red-500/20" />
              <div>
                <p className="font-medium mb-1">Delete Account</p>
                <p className="text-sm text-gray-400 mb-2">
                  Permanently delete your account and all data
                </p>
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
