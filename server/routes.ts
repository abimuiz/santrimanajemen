import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const { search, kelas, desa, ageRange, jenisKelamin } = req.query;
      
      let students;
      if (search) {
        students = await storage.searchStudents(search as string);
      } else if (kelas || desa || ageRange || jenisKelamin) {
        students = await storage.filterStudents({
          kelas: kelas as string,
          desa: desa as string,
          ageRange: ageRange as string,
          jenisKelamin: jenisKelamin as string,
        });
      } else {
        students = await storage.getAllStudents();
      }
      
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get student by ID
  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Create new student
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Update student
  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validatedData);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Delete student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getStudentStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Export students to Excel
  app.get("/api/students/export/excel", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Santri');
      
      // Add headers
      worksheet.columns = [
        { header: 'No. Urut', key: 'noUrut', width: 10 },
        { header: 'No. Registrasi', key: 'noReg', width: 15 },
        { header: 'NIS', key: 'nis', width: 12 },
        { header: 'Nama Lengkap', key: 'nama', width: 25 },
        { header: 'NIK', key: 'nik', width: 18 },
        { header: 'No. KK', key: 'noKk', width: 18 },
        { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
        { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
        { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
        { header: 'Umur', key: 'umur', width: 8 },
        { header: 'Agama', key: 'agama', width: 12 },
        { header: 'Kewarganegaraan', key: 'kewarganegaraan', width: 15 },
        { header: 'Anak Ke', key: 'anakKe', width: 10 },
        { header: 'Jumlah Saudara', key: 'jumlahSaudara', width: 15 },
        { header: 'Alamat', key: 'alamat', width: 30 },
        { header: 'RT', key: 'rt', width: 8 },
        { header: 'RW', key: 'rw', width: 8 },
        { header: 'Desa', key: 'desa', width: 20 },
        { header: 'Dusun', key: 'dusun', width: 15 },
        { header: 'Kecamatan', key: 'kecamatan', width: 20 },
        { header: 'Kabupaten', key: 'kabupaten', width: 20 },
        { header: 'Provinsi', key: 'provinsi', width: 20 },
        { header: 'Nama Ayah', key: 'namaAyah', width: 25 },
        { header: 'NIK Ayah', key: 'nikAyah', width: 18 },
        { header: 'Pekerjaan Ayah', key: 'pekerjaanAyah', width: 20 },
        { header: 'Nama Ibu', key: 'namaIbu', width: 25 },
        { header: 'NIK Ibu', key: 'nikIbu', width: 18 },
        { header: 'Pekerjaan Ibu', key: 'pekerjaanIbu', width: 20 },
        { header: 'Kelas', key: 'kelas', width: 12 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
        { header: 'No. WhatsApp', key: 'noWa', width: 15 },
        { header: 'Tanggal Masuk', key: 'tanggalMasuk', width: 15 },
      ];
      
      // Add data
      students.forEach(student => {
        worksheet.addRow(student);
      });
      
      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE3F2FD' }
      };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=data-santri.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Import students from Excel
  app.post("/api/students/import/excel", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const workbook = new ExcelJS.Workbook();
      const buffer = Buffer.from(req.file.buffer);
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        return res.status(400).json({ message: "No worksheet found" });
      }
      
      const students = [];
      const errors = [];
      
      // Skip header row, start from row 2
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        try {
          const studentData = {
            nama: row.getCell(4).text,
            nik: row.getCell(5).text,
            noKk: row.getCell(6).text,
            jenisKelamin: row.getCell(7).text,
            tempatLahir: row.getCell(8).text,
            tanggalLahir: row.getCell(9).text,
            agama: row.getCell(11).text,
            kewarganegaraan: row.getCell(12).text,
            anakKe: parseInt(row.getCell(13).text) || undefined,
            jumlahSaudara: parseInt(row.getCell(14).text) || undefined,
            alamat: row.getCell(15).text,
            rt: row.getCell(16).text,
            rw: row.getCell(17).text,
            desa: row.getCell(18).text,
            dusun: row.getCell(19).text,
            kecamatan: row.getCell(20).text,
            kabupaten: row.getCell(21).text,
            provinsi: row.getCell(22).text,
            namaAyah: row.getCell(23).text,
            nikAyah: row.getCell(24).text,
            pekerjaanAyah: row.getCell(25).text,
            namaIbu: row.getCell(26).text,
            nikIbu: row.getCell(27).text,
            pekerjaanIbu: row.getCell(28).text,
            kelas: row.getCell(29).text,
            keterangan: row.getCell(30).text,
            noWa: row.getCell(31).text,
            tanggalMasuk: row.getCell(32).text,
          };
          
          const validatedData = insertStudentSchema.parse(studentData);
          const student = await storage.createStudent(validatedData);
          students.push(student);
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error instanceof z.ZodError ? error.errors.map(e => e.message).join(', ') : 'Invalid data'}`);
        }
      }
      
      res.json({
        success: true,
        imported: students.length,
        errors: errors,
        message: `Successfully imported ${students.length} students${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  // Generate PDF for student
  app.get("/api/students/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=data-santri-${student.nis}.pdf`);
      
      doc.pipe(res);
      
      // Header
      doc.fontSize(20).text('FORMULIR DATA SANTRI', { align: 'center' });
      doc.fontSize(16).text('Sistem Kelola Data Santri', { align: 'center' });
      doc.moveDown(2);
      
      // Student data
      const fields = [
        ['No. Urut', student.noUrut],
        ['No. Registrasi', student.noReg],
        ['NIS', student.nis],
        ['Nama Lengkap', student.nama],
        ['NIK', student.nik],
        ['No. KK', student.noKk],
        ['Jenis Kelamin', student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
        ['Tempat, Tanggal Lahir', `${student.tempatLahir}, ${student.tanggalLahir}`],
        ['Umur', `${student.umur} tahun`],
        ['Agama', student.agama],
        ['Kewarganegaraan', student.kewarganegaraan],
        ['Anak ke-', student.anakKe],
        ['Jumlah Saudara', student.jumlahSaudara],
        ['Alamat', student.alamat],
        ['RT/RW', `${student.rt || '-'}/${student.rw || '-'}`],
        ['Desa', student.desa],
        ['Dusun', student.dusun || '-'],
        ['Kecamatan', student.kecamatan],
        ['Kabupaten', student.kabupaten],
        ['Provinsi', student.provinsi],
        ['Nama Ayah', student.namaAyah],
        ['NIK Ayah', student.nikAyah || '-'],
        ['Pekerjaan Ayah', student.pekerjaanAyah || '-'],
        ['Nama Ibu', student.namaIbu],
        ['NIK Ibu', student.nikIbu || '-'],
        ['Pekerjaan Ibu', student.pekerjaanIbu || '-'],
        ['Kelas', student.kelas],
        ['Tanggal Masuk', student.tanggalMasuk],
        ['No. WhatsApp', student.noWa || '-'],
        ['Keterangan', student.keterangan || '-'],
      ];
      
      fields.forEach(([label, value]) => {
        doc.fontSize(12)
           .text(`${label}:`, 50, doc.y, { continued: true, width: 150 })
           .text(String(value), 200, doc.y);
        doc.moveDown(0.5);
      });
      
      doc.end();
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
