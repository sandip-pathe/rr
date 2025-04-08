"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import CustomModal from "@/components/ModalWrapper";

interface StatsData {
  // Common
  projects?: number;
  research?: number;
  achievements?: string;

  // Student Specific
  cgpa?: number;
  topScore?: string;
  hackathons?: number;

  // Professor Specific
  ongoingProjects?: number;
  completedProjects?: number;
  studentsMentored?: number;
  coursesTaught?: number;
  mentees?: number;
  studentRating?: number;
}

interface ProfileStatsProps {
  role: "student" | "professor";
  initialData?: StatsData;
  onSave?: (data: StatsData) => void;
}

export default function ProfileStats({
  role,
  initialData,
  onSave,
}: ProfileStatsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<StatsData>(initialData || {});
  const [tempStats, setTempStats] = useState<StatsData>(initialData || {});

  const startEditing = () => {
    setTempStats(stats);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setStats(tempStats);
    setIsEditing(false);
    if (onSave) onSave(tempStats);
  };

  const renderStatItem = (
    value: number | string | undefined,
    label: string
  ) => {
    if (value === undefined || value === null) return null;

    return (
      <div className="bg-white/5 p-3 rounded-lg">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    );
  };

  const studentStats = [
    { value: stats.projects, label: "Projects" },
    { value: stats.research, label: "Research" },
    { value: stats.cgpa, label: "CGPA" },
    { value: stats.topScore, label: "Top Score" },
    { value: stats.hackathons, label: "Hackathons" },
  ].filter((stat) => stat.value !== undefined);

  const professorStats = [
    { value: stats.ongoingProjects, label: "Ongoing Projects" },
    { value: stats.completedProjects, label: "Completed Projects" },
    { value: stats.studentsMentored, label: "Students Mentored" },
    { value: stats.coursesTaught, label: "Courses Taught" },
    { value: stats.mentees, label: "Mentees" },
    { value: stats.research, label: "Research Published" },
    { value: stats.studentRating, label: "Student Rating" },
  ].filter((stat) => stat.value !== undefined);

  return (
    <>
      <Card className="bg-[#252525] border-0 relative">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Key Statistics</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={startEditing}
            className="text-primary hover:text-primary/80"
          >
            <FiEdit2 className="mr-2" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {role === "student" && (
              <>
                {stats.achievements && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Achievements</p>
                    <p className="text-sm">{stats.achievements}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studentStats.map((stat, index) =>
                    renderStatItem(stat.value, stat.label)
                  )}
                </div>
              </>
            )}

            {role === "professor" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {professorStats.map((stat, index) =>
                  renderStatItem(stat.value, stat.label)
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <CustomModal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Statistics</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <FiX className="mr-2" /> Cancel
              </Button>
              <Button onClick={saveChanges}>
                <FiSave className="mr-2" /> Save
              </Button>
            </div>
          </div>

          {role === "student" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Projects</label>
                  <Input
                    type="number"
                    value={tempStats.projects || ""}
                    onChange={(e) =>
                      setTempStats({
                        ...tempStats,
                        projects: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Research Papers
                  </label>
                  <Input
                    type="number"
                    value={tempStats.research || ""}
                    onChange={(e) =>
                      setTempStats({
                        ...tempStats,
                        research: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">CGPA</label>
                  <Input
                    type="number"
                    step="0.01"
                    max="10"
                    value={tempStats.cgpa || ""}
                    onChange={(e) =>
                      setTempStats({
                        ...tempStats,
                        cgpa: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Hackathons</label>
                  <Input
                    type="number"
                    value={tempStats.hackathons || ""}
                    onChange={(e) =>
                      setTempStats({
                        ...tempStats,
                        hackathons: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Top Score</label>
                <Input
                  value={tempStats.topScore || ""}
                  onChange={(e) =>
                    setTempStats({ ...tempStats, topScore: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Achievements (60 words)
                </label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm"
                  rows={3}
                  maxLength={60}
                  value={tempStats.achievements || ""}
                  onChange={(e) =>
                    setTempStats({ ...tempStats, achievements: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {role === "professor" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">
                  Ongoing Projects
                </label>
                <Input
                  type="number"
                  value={tempStats.ongoingProjects || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      ongoingProjects: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Completed Projects
                </label>
                <Input
                  type="number"
                  value={tempStats.completedProjects || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      completedProjects: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Students Mentored
                </label>
                <Input
                  type="number"
                  value={tempStats.studentsMentored || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      studentsMentored: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Courses Taught</label>
                <Input
                  type="number"
                  value={tempStats.coursesTaught || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      coursesTaught: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Mentees</label>
                <Input
                  type="number"
                  value={tempStats.mentees || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      mentees: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Research Published
                </label>
                <Input
                  type="number"
                  value={tempStats.research || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      research: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Student Rating (1-5)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={tempStats.studentRating || ""}
                  onChange={(e) =>
                    setTempStats({
                      ...tempStats,
                      studentRating: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}
