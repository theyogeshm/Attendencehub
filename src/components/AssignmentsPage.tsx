/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from "react";
import { Assignment, Subject } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import { 
  Rocket, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Clock, 
  MenuSquare,
  BookOpen,
  FolderMinus,
  Check,
  CheckSquare
} from "lucide-react";

interface AssignmentsPageProps {
  assignments: Assignment[];
  subjects: Subject[];
  onAddAssignment: (assignment: Omit<Assignment, "id">) => void;
  onToggleAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}

export default function AssignmentsPage({
  assignments,
  subjects,
  onAddAssignment,
  onToggleAssignment,
  onDeleteAssignment,
  onToast,
}: AssignmentsPageProps) {
  // Filters & Form States
  const [activeFilter, setActiveFilter] = useState<"All" | "Pending" | "Overdue">("All");
  
  const [formSubject, setFormSubject] = useState(() => subjects[0]?.name ?? "");
  const [formTitle, setFormTitle] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Utility to determine dynamic status
  const getTaskStatus = (task: Assignment): "COMPLETED" | "URGENT" | "UPCOMING" => {
    if (task.done) return "COMPLETED";
    if (!task.dueDate) return "UPCOMING";
    const diffMs = new Date(task.dueDate).getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) return "URGENT"; // Overdue or due soon
    return "UPCOMING";
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "No due date";
    const dateObj = new Date(dStr);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Submitting form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onToast("Please enter an assignment title.", "error");
      return;
    }

    onAddAssignment({
      title: formTitle,
      description: formDesc,
      subject: formSubject,
      dueDate: formDueDate,
      done: false,
    });

    // Reset fields cleanly
    setFormTitle("");
    setFormDueDate("");
    setFormDesc("");

    onToast("Assignment added!");
  };

  // Filter & Search Logic
  const filteredAssignments = assignments.filter((a) => {
    // Search filter
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Timeline tab filter
    if (activeFilter === "All") return true;
    if (activeFilter === "Pending") return !a.done;
    if (activeFilter === "Overdue") {
      return getTaskStatus(a) === "URGENT";
    }
    return true;
  });

  const pendingCount = assignments.filter((a) => !a.done).length;
  const completedCount = assignments.filter((a) => a.done).length;

  return (
    <div className="space-y-6">
      
      {/* Search Filter input wrapper for mobile */}
      <div className="flex sm:hidden">
        <input
          type="text"
          placeholder="Filter assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#171f33] border border-outline-variant rounded-xl p-3 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Dynamic Count Stats (4 of 12) */}
        <div className="xl:col-span-4 space-y-6">
          
          <section className="glass-card rounded-2xl p-6 sticky top-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-on-surface">New Task</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-variant mb-1 uppercase">Subject</label>
                <select 
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface outline-none cursor-pointer"
                >
                  {subjects.length === 0 ? (
                    <option value="" disabled>No subjects — set up profile first</option>
                  ) : (
                    subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-variant mb-1 uppercase font-mono">Title</label>
                <input 
                  type="text"
                  placeholder="e.g., Process Scheduling Lab"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-variant mb-1 uppercase font-mono">Due Date</label>
                <input 
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-variant mb-1 uppercase font-mono">Description</label>
                <textarea 
                  placeholder="Additional specifications or links..."
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary-container text-[#002114] font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary-container/20 cursor-pointer text-xs"
              >
                <Rocket className="w-4 h-4" />
                <span>Add Assignment</span>
              </button>
            </form>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-primary font-mono">{pendingCount}</span>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-1">Pending</span>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-secondary font-mono">{completedCount}</span>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-1">Completed</span>
            </div>
          </div>

        </div>

        {/* Right Column: Timelines list component (8 of 12) */}
        <div className="xl:col-span-8 space-y-6">
          
          <section className="glass-card rounded-2xl overflow-hidden border border-outline-variant">
            {/* Headers with filters bar */}
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-[#131b2e]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">filter_list</span>
                <h3 className="font-bold text-base">Timeline</h3>
              </div>
              <div className="flex gap-1.5 bg-[#0b1326] p-1 rounded-full border border-outline-variant">
                {(["All", "Pending", "Overdue"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      activeFilter === filter 
                        ? "bg-surface-variant text-primary" 
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List block */}
            <div className="divide-y divide-outline-variant">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((task) => {
                  const isCompleted = task.done;
                  const dynamicStatus = getTaskStatus(task);
                  return (
                    <div 
                      key={task.id} 
                      className={`group p-6 flex items-start gap-4 transition-all hover:bg-[#2d3449]/15 relative ${isCompleted ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox status marker trigger */}
                      <button 
                        onClick={() => onToggleAssignment(task.id)}
                        className={`flex-shrink-0 mt-0.5 w-6 h-6 border-2 rounded flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted 
                            ? "bg-primary border-primary" 
                            : "border-outline-variant hover:border-primary bg-transparent"
                        }`}
                        title={isCompleted ? "Mark Pending" : "Mark Completed"}
                      >
                        {isCompleted && <Check className="w-4 h-4 text-[#002114] stroke-[3]" />}
                      </button>

                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className={`font-bold text-base transition-colors ${isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface group-hover:text-primary'}`}>
                              {task.title}
                            </h4>
                            <p className={`text-xs text-on-surface-variant mt-1 overflow-hidden text-ellipsis line-clamp-1 ${isCompleted ? 'line-through' : ''}`}>
                              {task.description || "No additional specifications provided."}
                            </p>
                          </div>
                          
                          {/* Alert badges */}
                          <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded font-mono ${
                            isCompleted 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : dynamicStatus === "URGENT" 
                                ? "bg-error/10 text-error border border-error/20" 
                                : "bg-surface-variant text-on-surface-variant border border-outline-variant"
                          }`}>
                            {dynamicStatus}
                          </span>
                        </div>

                        {/* Metadata items */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-3">
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <BookOpen className="w-3.5 h-3.5 text-on-surface-variant" />
                            <span className="text-xs">{task.subject}</span>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 font-medium ${
                            dynamicStatus === "URGENT" && !isCompleted ? 'text-error' : 'text-on-surface-variant'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{formatDisplayDate(task.dueDate)}</span>
                          </div>
                        </div>

                      </div>

                      {/* Delete action wrapper button */}
                      <button 
                        onClick={() => setPendingDeleteId(task.id)}
                        className="p-1 px-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-error text-on-surface-variant cursor-pointer rounded-lg hover:bg-[#222a3d]"
                        title="Dismiss Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
                  <FolderMinus className="w-12 h-12 mb-3 text-outline" />
                  <p className="text-sm font-semibold">
                    {assignments.length === 0 
                      ? "No assignments yet. Add your first one!" 
                      : "No assignments found for the selected category filter."}
                  </p>
                </div>
              )}
            </div>

            {/* List footer - shows total count */}
            <div className="p-4 text-center bg-[#131b2e]/30 border-t border-outline-variant">
              <span className="text-[11px] font-mono font-bold text-on-surface-variant">
                {assignments.filter(a => a.done).length} of {assignments.length} completed
              </span>
            </div>

          </section>

        </div>

      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete Assignment"
        message="This assignment will be permanently deleted."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={() => {
          if (pendingDeleteId) onDeleteAssignment(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
