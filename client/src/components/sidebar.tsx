import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  BarChart3,
  Users,
  UserPlus,
  FileDown,
  FileUp,
  GraduationCap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Daftar Santri", href: "/students", icon: Users },
  { name: "Tambah Santri", href: "/add-student", icon: UserPlus },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/students/import/excel', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        if (response.ok) {
          alert(`Import berhasil! ${result.imported} data diimport${result.errors.length > 0 ? ` dengan ${result.errors.length} error` : ''}`);
          window.location.reload();
        } else {
          alert(`Import gagal: ${result.message}`);
        }
      } catch (error) {
        alert('Terjadi kesalahan saat import data');
      }
    };
    input.click();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/students/export/excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data-santri.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal mengexport data');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat export data');
    }
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">SantriData</h1>
            <p className="text-sm text-muted-foreground">Sistem Kelola Santri</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary-light font-medium"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleImport}
              className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              <FileUp className="w-5 h-5" />
              <span>Import Excel</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleExport}
              className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              <FileDown className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
