import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Printer, Trash2, FileUp, Plus, Download } from "lucide-react";
import { useLocation } from "wouter";
import StudentDetailModal from "@/components/student-detail-modal";
import type { Student } from "@shared/schema";
import { formatGender } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedAgeRange, setSelectedAgeRange] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (selectedClass) queryParams.append("kelas", selectedClass);
  if (selectedVillage) queryParams.append("desa", selectedVillage);
  if (selectedAgeRange) queryParams.append("ageRange", selectedAgeRange);

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/students?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Berhasil",
        description: "Data santri berhasil dihapus",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus data santri",
        variant: "destructive",
      });
    },
  });

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setLocation(`/edit-student/${student.id}`);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${student.nama}?`)) {
      deleteMutation.mutate(student.id);
    }
  };

  const handlePrintPDF = async (student: Student) => {
    try {
      const response = await fetch(`/api/students/${student.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-santri-${student.nis}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat PDF",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat PDF",
        variant: "destructive",
      });
    }
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
        toast({
          title: "Berhasil",
          description: "Data berhasil diexport",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal mengexport data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    }
  };

  // Get unique values for filters
  const uniqueClasses = Array.from(new Set(students?.map(s => s.kelas) || []));
  const uniqueVillages = Array.from(new Set(students?.map(s => s.desa) || []));

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Daftar Santri</h2>
            <p className="text-muted-foreground">Kelola dan lihat data semua santri</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setLocation("/add-student")}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Santri
            </Button>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Cari nama, NIS, atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={selectedClass || "all"} onValueChange={(value) => setSelectedClass(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {uniqueClasses.map((kelas) => (
                <SelectItem key={kelas} value={kelas}>
                  Kelas {kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVillage || "all"} onValueChange={(value) => setSelectedVillage(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Desa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Desa</SelectItem>
              {uniqueVillages.map((desa) => (
                <SelectItem key={desa} value={desa}>
                  {desa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAgeRange || "all"} onValueChange={(value) => setSelectedAgeRange(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Umur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Umur</SelectItem>
              <SelectItem value="12-15">12-15 tahun</SelectItem>
              <SelectItem value="16-18">16-18 tahun</SelectItem>
              <SelectItem value="19+">19+ tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No. Urut</TableHead>
                    <TableHead>No. Reg</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>No. KK</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Tempat Lahir</TableHead>
                    <TableHead>Tanggal Lahir</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>Agama</TableHead>
                    <TableHead>Kewarganegaraan</TableHead>
                    <TableHead>Anak Ke</TableHead>
                    <TableHead>Jumlah Saudara</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>RT</TableHead>
                    <TableHead>RW</TableHead>
                    <TableHead>Desa</TableHead>
                    <TableHead>Dusun</TableHead>
                    <TableHead>Kecamatan</TableHead>
                    <TableHead>Kabupaten</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead>Nama Ayah</TableHead>
                    <TableHead>NIK Ayah</TableHead>
                    <TableHead>Pekerjaan Ayah</TableHead>
                    <TableHead>Nama Ibu</TableHead>
                    <TableHead>Pekerjaan Ibu</TableHead>
                    <TableHead>NIK Ibu</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>No. WA</TableHead>
                    <TableHead>Tanggal Masuk</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 33 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : students && students.length > 0 ? (
                    students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.noUrut}</TableCell>
                        <TableCell>{student.noReg}</TableCell>
                        <TableCell className="font-medium">{student.nis}</TableCell>
                        <TableCell>{student.nama}</TableCell>
                        <TableCell>{student.nik}</TableCell>
                        <TableCell>{student.noKk}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.jenisKelamin === 'L' ? 'default' : 'secondary'}
                            className={student.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}
                          >
                            {formatGender(student.jenisKelamin)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.tempatLahir}</TableCell>
                        <TableCell>{new Date(student.tanggalLahir).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{student.umur} tahun</TableCell>
                        <TableCell>{student.agama}</TableCell>
                        <TableCell>{student.kewarganegaraan}</TableCell>
                        <TableCell>{student.anakKe || '-'}</TableCell>
                        <TableCell>{student.jumlahSaudara || '-'}</TableCell>
                        <TableCell className="max-w-40 truncate" title={student.alamat}>{student.alamat}</TableCell>
                        <TableCell>{student.rt || '-'}</TableCell>
                        <TableCell>{student.rw || '-'}</TableCell>
                        <TableCell>{student.desa}</TableCell>
                        <TableCell>{student.dusun || '-'}</TableCell>
                        <TableCell>{student.kecamatan}</TableCell>
                        <TableCell>{student.kabupaten}</TableCell>
                        <TableCell>{student.provinsi}</TableCell>
                        <TableCell>{student.namaAyah}</TableCell>
                        <TableCell>{student.nikAyah || '-'}</TableCell>
                        <TableCell>{student.pekerjaanAyah || '-'}</TableCell>
                        <TableCell>{student.namaIbu}</TableCell>
                        <TableCell>{student.pekerjaanIbu || '-'}</TableCell>
                        <TableCell>{student.nikIbu || '-'}</TableCell>
                        <TableCell>{student.kelas}</TableCell>
                        <TableCell className="max-w-32 truncate" title={student.keterangan || '-'}>{student.keterangan || '-'}</TableCell>
                        <TableCell>{student.noWa || '-'}</TableCell>
                        <TableCell>{new Date(student.tanggalMasuk).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintPDF(student)}
                              title="Print PDF"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={33} className="text-center text-muted-foreground py-8">
                        Tidak ada data santri
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentDetailModal
        student={selectedStudent}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onEdit={handleEditStudent}
        onPrintPDF={handlePrintPDF}
      />
    </div>
  );
}
