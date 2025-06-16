import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Edit } from "lucide-react";
import type { Student } from "@shared/schema";
import { formatDate, formatGender } from "@/lib/utils";

interface StudentDetailModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (student: Student) => void;
  onPrintPDF: (student: Student) => void;
}

export default function StudentDetailModal({
  student,
  open,
  onOpenChange,
  onEdit,
  onPrintPDF,
}: StudentDetailModalProps) {
  if (!student) return null;

  const handlePrintPDF = async () => {
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
        alert('Gagal membuat PDF');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat membuat PDF');
    }
  };

  const fields = [
    { label: "NIS", value: student.nis },
    { label: "No. Registrasi", value: student.noReg },
    { label: "Nama Lengkap", value: student.nama },
    { label: "NIK", value: student.nik },
    { label: "No. KK", value: student.noKk },
    { label: "Jenis Kelamin", value: formatGender(student.jenisKelamin) },
    { label: "Tempat, Tanggal Lahir", value: `${student.tempatLahir}, ${formatDate(student.tanggalLahir)}` },
    { label: "Umur", value: `${student.umur} tahun` },
    { label: "Agama", value: student.agama },
    { label: "Kewarganegaraan", value: student.kewarganegaraan },
    { label: "Anak ke-", value: student.anakKe || "-" },
    { label: "Jumlah Saudara", value: student.jumlahSaudara || "-" },
    { label: "Alamat", value: student.alamat },
    { label: "RT/RW", value: `${student.rt || "-"}/${student.rw || "-"}` },
    { label: "Desa", value: student.desa },
    { label: "Dusun", value: student.dusun || "-" },
    { label: "Kecamatan", value: student.kecamatan },
    { label: "Kabupaten", value: student.kabupaten },
    { label: "Provinsi", value: student.provinsi },
    { label: "Nama Ayah", value: student.namaAyah },
    { label: "NIK Ayah", value: student.nikAyah || "-" },
    { label: "Pekerjaan Ayah", value: student.pekerjaanAyah || "-" },
    { label: "Nama Ibu", value: student.namaIbu },
    { label: "NIK Ibu", value: student.nikIbu || "-" },
    { label: "Pekerjaan Ibu", value: student.pekerjaanIbu || "-" },
    { label: "Kelas", value: student.kelas },
    { label: "Tanggal Masuk", value: formatDate(student.tanggalMasuk) },
    { label: "No. WhatsApp", value: student.noWa || "-" },
    { label: "Keterangan", value: student.keterangan || "-" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Data Santri</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.label}>
                <span className="text-sm font-medium text-muted-foreground">{field.label}:</span>
                <p className="text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onEdit(student)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handlePrintPDF}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
