export interface AudioUrls {
  "01": string;
  "02": string;
  "03": string;
  "04": string;
  "05": string;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: AudioUrls;
}

export interface NextSurah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioUrls;
  ayat: Ayat[];
  suratSelanjutnya?: NextSurah;
  suratSebelumnya?: NextSurah;
}