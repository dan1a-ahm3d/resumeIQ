"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section Editing States
  const [isEditingPersonal, setIsEditingPersonal] = useState<boolean>(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [summary, setSummary] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // New tag inputs
  const [newSkill, setNewSkill] = useState<string>("");
  const [newInterest, setNewInterest] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setPhone(data.phone);
      setRole(data.role);
      setCompany(data.company);
      setExperienceYears(data.experienceYears);
      setSummary(data.professionalSummary);
      setNotes(data.notes);
    } catch {
      setStatusMessage({ type: "error", text: "Unable to load profile information." });
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSavePersonal = async () => {
    if (!fullName.trim()) {
      showNotification("Full name cannot be empty.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      setProfile(updated);
      setIsEditingPersonal(false);
      showNotification("Personal information saved successfully.");
    } catch {
      showNotification("Failed to update personal information.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfessional = async () => {
    if (!role.trim() || !company.trim()) {
      showNotification("Role and Company cannot be empty.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile({
        role: role.trim(),
        company: company.trim(),
        experienceYears: Number(experienceYears) || 0,
        professionalSummary: summary.trim(),
      });
      setProfile(updated);
      setIsEditingProfessional(false);
      showNotification("Professional credentials saved successfully.");
    } catch {
      showNotification("Failed to update professional information.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateNotes(notes.trim());
      setProfile(updated);
      setIsEditingNotes(false);
      showNotification("Personal workspace notes updated.");
    } catch {
      showNotification("Failed to save notes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !profile) return;
    const clean = newSkill.trim();
    if (profile.skills.includes(clean)) {
      setNewSkill("");
      return;
    }
    const updatedSkills = [...profile.skills, clean];
    const updated = await profileService.updateProfile({ skills: updatedSkills });
    setProfile(updated);
    setNewSkill("");
    showNotification(`Skill '${clean}' added.`);
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!profile) return;
    const updatedSkills = profile.skills.filter((s) => s !== skillToRemove);
    const updated = await profileService.updateProfile({ skills: updatedSkills });
    setProfile(updated);
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || !profile) return;
    const clean = newInterest.trim();
    if (profile.interests.includes(clean)) {
      setNewInterest("");
      return;
    }
    const updatedInterests = [...profile.interests, clean];
    const updated = await profileService.updateProfile({ interests: updatedInterests });
    setProfile(updated);
    setNewInterest("");
    showNotification(`Interest '${clean}' added.`);
  };

  const handleRemoveInterest = async (interestToRemove: string) => {
    if (!profile) return;
    const updated = await profileService.updateProfile({
      interests: profile.interests.filter((i) => i !== interestToRemove),
    });
    setProfile(updated);
  };

  if (isLoading || !profile) {
    return (
      <div className="max-w-[1240px] w-full mx-auto pb-space-xl space-y-space-lg">
        <PageHeader title="User Profile" description="Loading profile information..." />
        <div className="p-8 text-center text-secondary font-meta-default">
          <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
          <p className="mt-2">Retrieving recruiter profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] w-full mx-auto pb-space-xl space-y-space-lg">
      {/* Top Header */}
      <PageHeader
        title="Recruiter Identity & Profile"
        description="Manage professional credentials, evaluation calibration highlights, and workspace notes."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-code-mono text-[11px] bg-surface-container text-secondary px-2.5 py-1 rounded-[4px] border border-outline-variant/30">
              UID: {profile.id}
            </span>
          </div>
        }
      />

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-[4px] border text-xs font-body-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-surface-container border-outline-variant/40 text-on-surface"
              : "bg-error-container/40 border-error/30 text-error"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">
              {statusMessage.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-secondary hover:text-on-surface font-semibold text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Identity Card */}
      <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center text-xl font-bold border border-outline-variant/20 shadow-xs">
            {profile.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {profile.fullName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-code-mono bg-surface-container text-on-surface border border-outline-variant/30">
                Verified Recruiter
              </span>
            </div>
            <p className="font-meta-default text-meta-default text-secondary mt-0.5">
              {profile.role} · {profile.company}
            </p>
            <p className="font-code-mono text-[11px] text-outline mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="font-label-default text-label-default text-on-surface">
              {profile.experienceYears} Years Experience
            </div>
            <div className="font-meta-default text-meta-default text-secondary">
              EEOC Certified Assessor
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Grid: Personal & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* SECTION 1 — PERSONAL INFORMATION */}
        <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  person
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Personal Information
                </h3>
              </div>
              {!isEditingPersonal && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="edit"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingPersonal ? (
              <div className="space-y-3">
                <div>
                  <label className="font-label-default text-[12px] text-on-surface block mb-1">
                    Full Name:
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recruiter Full Name"
                  />
                </div>
                <div>
                  <label className="font-label-default text-[12px] text-on-surface block mb-1">
                    Corporate Email (Managed by Auth):
                  </label>
                  <Input
                    value={profile.email}
                    disabled
                    className="opacity-70 bg-surface-container-low cursor-not-allowed"
                  />
                  <span className="text-[11px] text-secondary font-meta-default block mt-1">
                    Email updates require verified single-sign-on administrative approval.
                  </span>
                </div>
                <div>
                  <label className="font-label-default text-[12px] text-on-surface block mb-1">
                    Phone / Contact Number:
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-3 font-body-default text-body-default">
                <div>
                  <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                    Full Name
                  </dt>
                  <dd className="font-body-medium text-on-surface mt-0.5">{profile.fullName}</dd>
                </div>
                <div>
                  <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                    Email Address
                  </dt>
                  <dd className="font-code-mono text-[13px] text-on-surface mt-0.5 flex items-center gap-1.5">
                    {profile.email}
                    <span className="material-symbols-outlined text-[14px] text-secondary" title="Corporate Verified">
                      verified
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                    Contact Phone
                  </dt>
                  <dd className="font-body-medium text-on-surface mt-0.5">{profile.phone}</dd>
                </div>
              </dl>
            )}
          </div>

          {isEditingPersonal && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/20 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFullName(profile.fullName);
                  setPhone(profile.phone);
                  setIsEditingPersonal(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="dark" size="sm" onClick={handleSavePersonal} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </section>

        {/* SECTION 2 — PROFESSIONAL INFORMATION */}
        <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  badge
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Professional Information
                </h3>
              </div>
              {!isEditingProfessional && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="edit"
                  onClick={() => setIsEditingProfessional(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingProfessional ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-label-default text-[12px] text-on-surface block mb-1">
                      Role / Title:
                    </label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-label-default text-[12px] text-on-surface block mb-1">
                      Years of Experience:
                    </label>
                    <Input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-default text-[12px] text-on-surface block mb-1">
                    Company / Organization:
                  </label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div>
                  <label className="font-label-default text-[12px] text-on-surface block mb-1">
                    Professional Summary:
                  </label>
                  <Textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Summary of domain specialties..."
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-3 font-body-default text-body-default">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                      Role / Position
                    </dt>
                    <dd className="font-body-medium text-on-surface mt-0.5">{profile.role}</dd>
                  </div>
                  <div>
                    <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                      Experience
                    </dt>
                    <dd className="font-body-medium text-on-surface mt-0.5">
                      {profile.experienceYears} Years
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                    Company
                  </dt>
                  <dd className="font-body-medium text-on-surface mt-0.5">{profile.company}</dd>
                </div>
                <div>
                  <dt className="text-secondary text-[11px] font-table-header uppercase tracking-wider">
                    Professional Summary
                  </dt>
                  <dd className="font-body-default text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                    {profile.professionalSummary}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {isEditingProfessional && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/20 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRole(profile.role);
                  setCompany(profile.company);
                  setExperienceYears(profile.experienceYears);
                  setSummary(profile.professionalSummary);
                  setIsEditingProfessional(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="dark" size="sm" onClick={handleSaveProfessional} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* SECTION 3 — SKILLS & RECRUITMENT INTERESTS */}
      <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30">
        <div className="border-b border-outline-variant/20 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              stars
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Domain Competencies & Recruitment Interests
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Skills */}
          <div>
            <span className="text-secondary text-[11px] font-table-header uppercase tracking-wider block mb-2">
              Evaluation & Sourcing Skills
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface border border-outline-variant/30 px-2 py-0.5 rounded text-[12px] font-body-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-error text-secondary text-[14px] leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add skill (e.g. Behavioral Rubrics)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                className="h-7 text-xs"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
          </div>

          {/* Interests */}
          <div>
            <span className="text-secondary text-[11px] font-table-header uppercase tracking-wider block mb-2">
              Technical Focus Areas
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 bg-surface-container text-on-surface border border-outline-variant/40 px-2 py-0.5 rounded text-[12px] font-body-medium"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-error text-secondary text-[14px] leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add focus area (e.g. Distributed Systems)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                className="h-7 text-xs"
              />
              <Button variant="secondary" size="sm" onClick={handleAddInterest}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HIGHLIGHTS & CERTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Career Highlights */}
        <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30">
          <div className="border-b border-outline-variant/20 pb-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              emoji_events
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Evaluation Milestones & Highlights
            </h3>
          </div>
          <ul className="space-y-2.5">
            {profile.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-on-surface leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Certifications */}
        <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30">
          <div className="border-b border-outline-variant/20 pb-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              verified_user
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Professional Certifications
            </h3>
          </div>
          <ul className="space-y-3">
            {profile.certifications.map((c, i) => (
              <li key={i} className="flex items-center gap-3 p-2.5 rounded bg-surface-container-low/40 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  workspace_premium
                </span>
                <span className="font-body-medium text-[13px] text-on-surface">{c}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* SECTION 5 — PERSONAL WORKSPACE NOTES */}
      <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              sticky_note_2
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Workspace Calibration Notes
              </h3>
              <p className="font-meta-default text-meta-default text-secondary mt-0.5">
                Private notes and reminders for calibration panels and candidate verification debriefs.
              </p>
            </div>
          </div>
          {!isEditingNotes && (
            <Button
              variant="secondary"
              size="sm"
              icon="edit_note"
              onClick={() => setIsEditingNotes(true)}
            >
              Edit Notes
            </Button>
          )}
        </div>

        {isEditingNotes ? (
          <div>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record personal notes regarding candidate evaluation rubrics or requisition status..."
            />
            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotes(profile.notes);
                  setIsEditingNotes(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="dark" size="sm" onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-surface-container-low/30 rounded border border-outline-variant/20 text-[13px] text-on-surface leading-relaxed whitespace-pre-wrap font-body-default">
            {profile.notes || (
              <span className="text-secondary italic">
                No personal notes added yet. Click &apos;Edit Notes&apos; to record hiring reminders.
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
