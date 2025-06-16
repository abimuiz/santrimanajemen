import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, UserCheck, Calendar } from "lucide-react";
import ClassChart from "@/components/charts/class-chart";
import AgeChart from "@/components/charts/age-chart";
import type { StudentStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<StudentStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentActivities = [
    {
      icon: Users,
      title: "Data sistem diperbarui",
      description: "Statistik terbaru telah dimuat",
      time: "Baru saja",
      bgColor: "bg-primary-light",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Ringkasan data santri dan statistik</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Terakhir diperbarui</p>
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Santri</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalStudents || 0}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <span>Total keseluruhan</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Santri Putra</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.maleStudents || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats?.totalStudents ? Math.round((stats.maleStudents / stats.totalStudents) * 100) : 0}% dari total
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Santri Putri</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.femaleStudents || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats?.totalStudents ? Math.round((stats.femaleStudents / stats.totalStudents) * 100) : 0}% dari total
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rata-rata Umur</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.averageAge || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">tahun</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Santri per Kelas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.studentsByClass ? (
                <ClassChart data={stats.studentsByClass} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Umur</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.ageDistribution ? (
                <AgeChart data={stats.ageDistribution} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
                  <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
