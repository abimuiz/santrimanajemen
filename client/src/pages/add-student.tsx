import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateAge } from "@/lib/utils";

export default function AddStudent() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEdit = params.id !== undefined;
  const studentId = params.id ? parseInt(params.id) : undefined;

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      nama: "",
      nik: "",
      noKk: "",
      jenisKelamin: "",
      tempatLahir: "",
      tanggalLahir: "",
      agama: "",
      kewarganegaraan: "",
      alamat: "",
      desa: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      namaAyah: "",
      namaIbu: "",
      kelas: "",
      tanggalMasuk: "",
    },
  });

  // Fetch student data for editing
  const { data: student } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      return response.json();
    },
    enabled: isEdit && !!studentId,
  });

  // Populate form when editing
  useEffect(() => {
    if (student && isEdit) {
      form.reset({
        nama: student.nama,
        nik: student.nik,
        noKk: student.noKk,
        jenisKelamin: student.jenisKelamin,
        tempatLahir: student.tempatLahir,
        tanggalLahir: student.tanggalLahir,
        agama: student.agama,
        kewarganegaraan: student.kewarganegaraan,
        anakKe: student.anakKe,
        jumlahSaudara: student.jumlahSaudara,
        alamat: student.alamat,
        rt: student.rt,
        rw: student.rw,
        desa: student.desa,
        dusun: student.dusun,
        kecamatan: student.kecamatan,
        kabupaten: student.kabupaten,
        provinsi: student.provinsi,
        namaAyah: student.namaAyah,
        nikAyah: student.nikAyah,
        pekerjaanAyah: student.pekerjaanAyah,
        namaIbu: student.namaIbu,
        nikIbu: student.nikIbu,
        pekerjaanIbu: student.pekerjaanIbu,
        kelas: student.kelas,
        keterangan: student.keterangan,
        noWa: student.noWa,
        tanggalMasuk: student.tanggalMasuk,
      });
    }
  }, [student, isEdit, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      if (isEdit && studentId) {
        return apiRequest("PUT", `/api/students/${studentId}`, data);
      } else {
        return apiRequest("POST", "/api/students", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: `Data santri berhasil ${isEdit ? 'diperbarui' : 'disimpan'}`,
      });
      setLocation("/students");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data santri`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStudent) => {
    mutation.mutate(data);
  };

  // Watch birth date to calculate age
  const watchedBirthDate = form.watch("tanggalLahir");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  useEffect(() => {
    if (watchedBirthDate) {
      const age = calculateAge(watchedBirthDate);
      setCalculatedAge(age);
    }
  }, [watchedBirthDate]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {isEdit ? 'Edit Santri' : 'Tambah Santri Baru'}
            </h2>
            <p className="text-muted-foreground">
              {isEdit ? 'Perbarui data santri' : 'Isi semua data santri dengan lengkap'}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation("/students")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      {/* Form Content */}
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8">
                {/* Auto-generated Fields (Read-only) */}
                {!isEdit && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <Label>No. Urut</Label>
                      <Input value="Auto-generated" readOnly className="bg-muted" />
                    </div>
                    <div>
                      <Label>No. Registrasi</Label>
                      <Input value="Auto-generated" readOnly className="bg-muted" />
                    </div>
                    <div>
                      <Label>NIS</Label>
                      <Input value="Auto-generated" readOnly className="bg-muted" />
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    Data Pribadi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nama Lengkap *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noKk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. KK *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jenisKelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="L">Laki-laki</SelectItem>
                              <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tempatLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempat Lahir *</FormLabel>
                          <FormControl>
                            <Input placeholder="Kota kelahiran" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tanggalLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label>Umur</Label>
                      <Input 
                        value={calculatedAge ? `${calculatedAge} tahun` : "Auto-calculated"} 
                        readOnly 
                        className="bg-muted" 
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="agama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agama *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih agama" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Islam">Islam</SelectItem>
                              <SelectItem value="Kristen">Kristen</SelectItem>
                              <SelectItem value="Katolik">Katolik</SelectItem>
                              <SelectItem value="Hindu">Hindu</SelectItem>
                              <SelectItem value="Buddha">Buddha</SelectItem>
                              <SelectItem value="Konghucu">Konghucu</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kewarganegaraan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kewarganegaraan *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kewarganegaraan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WNI">WNI</SelectItem>
                              <SelectItem value="WNA">WNA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="anakKe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anak ke-</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jumlahSaudara"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Saudara</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    Alamat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="alamat"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Alamat Lengkap *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Jalan, nomor rumah, dsb..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RT</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rw"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RW</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="desa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desa/Kelurahan *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama desa/kelurahan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dusun"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dusun</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama dusun" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kecamatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kecamatan *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama kecamatan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kabupaten"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kabupaten/Kota *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama kabupaten/kota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provinsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provinsi *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama provinsi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Parent Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    Data Orang Tua
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Father Information */}
                    <div>
                      <h4 className="text-md font-medium text-foreground mb-4">Data Ayah</h4>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="namaAyah"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Ayah *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nama lengkap ayah" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nikAyah"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIK Ayah</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pekerjaanAyah"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pekerjaan Ayah</FormLabel>
                              <FormControl>
                                <Input placeholder="Pekerjaan ayah" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Mother Information */}
                    <div>
                      <h4 className="text-md font-medium text-foreground mb-4">Data Ibu</h4>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="namaIbu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Ibu *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nama lengkap ibu" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nikIbu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIK Ibu</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pekerjaanIbu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pekerjaan Ibu</FormLabel>
                              <FormControl>
                                <Input placeholder="Pekerjaan ibu" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    Data Pendidikan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="kelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelas *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1A">Kelas 1A</SelectItem>
                              <SelectItem value="1B">Kelas 1B</SelectItem>
                              <SelectItem value="2A">Kelas 2A</SelectItem>
                              <SelectItem value="2B">Kelas 2B</SelectItem>
                              <SelectItem value="3A">Kelas 3A</SelectItem>
                              <SelectItem value="3B">Kelas 3B</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tanggalMasuk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Masuk *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noWa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="081234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keterangan"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Keterangan</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Keterangan tambahan..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation("/students")}
                    disabled={mutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Menyimpan..." : (isEdit ? "Perbarui Data" : "Simpan Data")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
