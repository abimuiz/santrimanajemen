import { pgTable, text, serial, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  noUrut: integer("no_urut").notNull(),
  noReg: text("no_reg").notNull().unique(),
  nis: text("nis").notNull().unique(),
  nama: text("nama").notNull(),
  nik: text("nik").notNull(),
  noKk: text("no_kk").notNull(),
  jenisKelamin: text("jenis_kelamin").notNull(),
  tempatLahir: text("tempat_lahir").notNull(),
  tanggalLahir: date("tanggal_lahir").notNull(),
  umur: integer("umur").notNull(),
  agama: text("agama").notNull(),
  kewarganegaraan: text("kewarganegaraan").notNull(),
  anakKe: integer("anak_ke"),
  jumlahSaudara: integer("jumlah_saudara"),
  alamat: text("alamat").notNull(),
  rt: text("rt"),
  rw: text("rw"),
  desa: text("desa").notNull(),
  dusun: text("dusun"),
  kecamatan: text("kecamatan").notNull(),
  kabupaten: text("kabupaten").notNull(),
  provinsi: text("provinsi").notNull(),
  namaAyah: text("nama_ayah").notNull(),
  nikAyah: text("nik_ayah"),
  pekerjaanAyah: text("pekerjaan_ayah"),
  namaIbu: text("nama_ibu").notNull(),
  nikIbu: text("nik_ibu"),
  pekerjaanIbu: text("pekerjaan_ibu"),
  kelas: text("kelas").notNull(),
  keterangan: text("keterangan"),
  noWa: text("no_wa"),
  tanggalMasuk: date("tanggal_masuk").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  noUrut: true,
  noReg: true,
  nis: true,
  umur: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Statistics types
export type StudentStats = {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  averageAge: number;
  studentsByClass: { kelas: string; count: number }[];
  ageDistribution: { ageRange: string; count: number }[];
};
