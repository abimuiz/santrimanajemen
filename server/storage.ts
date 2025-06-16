import { students, type Student, type InsertStudent, type StudentStats } from "@shared/schema";

export interface IStorage {
  getStudent(id: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  searchStudents(query: string): Promise<Student[]>;
  filterStudents(filters: {
    kelas?: string;
    desa?: string;
    ageRange?: string;
    jenisKelamin?: string;
  }): Promise<Student[]>;
  getStudentStats(): Promise<StudentStats>;
  getNextSequence(): Promise<{ noUrut: number; noReg: string; nis: string }>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private currentId: number;
  private currentSequence: number;

  constructor() {
    this.students = new Map();
    this.currentId = 1;
    this.currentSequence = 1;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values()).sort((a, b) => a.noUrut - b.noUrut);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const { noUrut, noReg, nis } = await this.getNextSequence();
    
    // Calculate age from birth date
    const birthDate = new Date(insertStudent.tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const id = this.currentId++;
    const student: Student = {
      id,
      noUrut,
      noReg,
      nis,
      umur: age,
      nama: insertStudent.nama,
      nik: insertStudent.nik,
      noKk: insertStudent.noKk,
      jenisKelamin: insertStudent.jenisKelamin,
      tempatLahir: insertStudent.tempatLahir,
      tanggalLahir: insertStudent.tanggalLahir,
      agama: insertStudent.agama,
      kewarganegaraan: insertStudent.kewarganegaraan,
      anakKe: insertStudent.anakKe || null,
      jumlahSaudara: insertStudent.jumlahSaudara || null,
      alamat: insertStudent.alamat,
      rt: insertStudent.rt || null,
      rw: insertStudent.rw || null,
      desa: insertStudent.desa,
      dusun: insertStudent.dusun || null,
      kecamatan: insertStudent.kecamatan,
      kabupaten: insertStudent.kabupaten,
      provinsi: insertStudent.provinsi,
      namaAyah: insertStudent.namaAyah,
      nikAyah: insertStudent.nikAyah || null,
      pekerjaanAyah: insertStudent.pekerjaanAyah || null,
      namaIbu: insertStudent.namaIbu,
      nikIbu: insertStudent.nikIbu || null,
      pekerjaanIbu: insertStudent.pekerjaanIbu || null,
      kelas: insertStudent.kelas,
      keterangan: insertStudent.keterangan || null,
      noWa: insertStudent.noWa || null,
      tanggalMasuk: insertStudent.tanggalMasuk,
    };
    
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    // Recalculate age if birth date is updated
    let updatedAge = student.umur;
    if (updateData.tanggalLahir) {
      const birthDate = new Date(updateData.tanggalLahir);
      const today = new Date();
      updatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        updatedAge--;
      }
    }

    const updatedStudent: Student = {
      id: student.id,
      noUrut: student.noUrut,
      noReg: student.noReg,
      nis: student.nis,
      umur: updatedAge,
      nama: updateData.nama ?? student.nama,
      nik: updateData.nik ?? student.nik,
      noKk: updateData.noKk ?? student.noKk,
      jenisKelamin: updateData.jenisKelamin ?? student.jenisKelamin,
      tempatLahir: updateData.tempatLahir ?? student.tempatLahir,
      tanggalLahir: updateData.tanggalLahir ?? student.tanggalLahir,
      agama: updateData.agama ?? student.agama,
      kewarganegaraan: updateData.kewarganegaraan ?? student.kewarganegaraan,
      anakKe: updateData.anakKe !== undefined ? updateData.anakKe || null : student.anakKe,
      jumlahSaudara: updateData.jumlahSaudara !== undefined ? updateData.jumlahSaudara || null : student.jumlahSaudara,
      alamat: updateData.alamat ?? student.alamat,
      rt: updateData.rt !== undefined ? updateData.rt || null : student.rt,
      rw: updateData.rw !== undefined ? updateData.rw || null : student.rw,
      desa: updateData.desa ?? student.desa,
      dusun: updateData.dusun !== undefined ? updateData.dusun || null : student.dusun,
      kecamatan: updateData.kecamatan ?? student.kecamatan,
      kabupaten: updateData.kabupaten ?? student.kabupaten,
      provinsi: updateData.provinsi ?? student.provinsi,
      namaAyah: updateData.namaAyah ?? student.namaAyah,
      nikAyah: updateData.nikAyah !== undefined ? updateData.nikAyah || null : student.nikAyah,
      pekerjaanAyah: updateData.pekerjaanAyah !== undefined ? updateData.pekerjaanAyah || null : student.pekerjaanAyah,
      namaIbu: updateData.namaIbu ?? student.namaIbu,
      nikIbu: updateData.nikIbu !== undefined ? updateData.nikIbu || null : student.nikIbu,
      pekerjaanIbu: updateData.pekerjaanIbu !== undefined ? updateData.pekerjaanIbu || null : student.pekerjaanIbu,
      kelas: updateData.kelas ?? student.kelas,
      keterangan: updateData.keterangan !== undefined ? updateData.keterangan || null : student.keterangan,
      noWa: updateData.noWa !== undefined ? updateData.noWa || null : student.noWa,
      tanggalMasuk: updateData.tanggalMasuk ?? student.tanggalMasuk,
    };
    
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async searchStudents(query: string): Promise<Student[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.students.values()).filter(student =>
      student.nama.toLowerCase().includes(lowercaseQuery) ||
      student.nis.toLowerCase().includes(lowercaseQuery) ||
      student.nik.toLowerCase().includes(lowercaseQuery) ||
      student.noReg.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterStudents(filters: {
    kelas?: string;
    desa?: string;
    ageRange?: string;
    jenisKelamin?: string;
  }): Promise<Student[]> {
    return Array.from(this.students.values()).filter(student => {
      if (filters.kelas && student.kelas !== filters.kelas) return false;
      if (filters.desa && student.desa !== filters.desa) return false;
      if (filters.jenisKelamin && student.jenisKelamin !== filters.jenisKelamin) return false;
      
      if (filters.ageRange) {
        const age = student.umur;
        switch (filters.ageRange) {
          case '12-15':
            return age >= 12 && age <= 15;
          case '16-18':
            return age >= 16 && age <= 18;
          case '19+':
            return age >= 19;
          default:
            return true;
        }
      }
      
      return true;
    });
  }

  async getStudentStats(): Promise<StudentStats> {
    const allStudents = Array.from(this.students.values());
    const totalStudents = allStudents.length;
    const maleStudents = allStudents.filter(s => s.jenisKelamin === 'L').length;
    const femaleStudents = allStudents.filter(s => s.jenisKelamin === 'P').length;
    
    const averageAge = totalStudents > 0 
      ? Math.round((allStudents.reduce((sum, s) => sum + s.umur, 0) / totalStudents) * 10) / 10
      : 0;

    // Group by class
    const classCounts = new Map<string, number>();
    allStudents.forEach(student => {
      classCounts.set(student.kelas, (classCounts.get(student.kelas) || 0) + 1);
    });
    
    const studentsByClass = Array.from(classCounts.entries()).map(([kelas, count]) => ({
      kelas,
      count,
    }));

    // Age distribution
    const ageRanges = [
      { range: '12-15 tahun', min: 12, max: 15 },
      { range: '16-18 tahun', min: 16, max: 18 },
      { range: '19+ tahun', min: 19, max: 100 },
    ];

    const ageDistribution = ageRanges.map(({ range, min, max }) => ({
      ageRange: range,
      count: allStudents.filter(s => s.umur >= min && s.umur <= max).length,
    }));

    return {
      totalStudents,
      maleStudents,
      femaleStudents,
      averageAge,
      studentsByClass,
      ageDistribution,
    };
  }

  async getNextSequence(): Promise<{ noUrut: number; noReg: string; nis: string }> {
    const noUrut = this.currentSequence++;
    const currentYear = new Date().getFullYear();
    const noReg = `REG-${currentYear}-${noUrut.toString().padStart(3, '0')}`;
    const nis = `${currentYear}${noUrut.toString().padStart(3, '0')}`;
    
    return { noUrut, noReg, nis };
  }
}

export const storage = new MemStorage();
