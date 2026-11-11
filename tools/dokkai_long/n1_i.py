# -*- coding: utf-8 -*-
PT = "Soal 統合: tandai pendapat A dan B secara terpisah, lalu cari titik temu/perbedaannya."
JT = 'Bacaan gabungan (統合理解)'
R = ['Tidak disebut dalam teks.', 'Berlawanan dengan isi teks.', 'Berlebihan / bukan argumen penulis.']
def X(jp, id, qs):
    return dict(slot='tou', jenis=JT, jp=jp, id=id, qs=[(q, [ok] + w, 0, al, bu, R, PT) for (q, ok, w, al, bu) in qs])
B = [
 X('<b>【A】</b><br>テレワークの普及で、通勤の負担が減り、育児や介護と仕事を両立しやすくなった。場所に縛られない働き方は、多様な人材が活躍する社会につながる。出社を前提とした働き方には、戻るべきではない。<br><br><b>【B】</b><br>テレワークは便利だが、顔を合わせない状態が続くと、新入社員の育成や、雑談から生まれる発想が失われがちである。組織の一体感を保つためにも、定期的に出社して対面で交流する機会は欠かせない。',
   '[A] Dengan meluasnya telework, beban perjalanan berkurang dan lebih mudah menyeimbangkan pekerjaan dengan pengasuhan dan perawatan. Cara kerja tak terikat tempat menuju masyarakat di mana beragam SDM berperan. Tak seharusnya kembali ke cara kerja yang mengandalkan datang ke kantor.\n[B] Telework praktis, tetapi bila tak bertatap muka berlanjut, pembinaan karyawan baru dan gagasan dari obrolan ringan cenderung hilang. Demi menjaga kebersamaan organisasi pun, kesempatan datang berkala ke kantor dan berinteraksi langsung tak terpisahkan.',
   [('テレワークに ついて、Bが 指摘する 問題点は どれか。', '新入社員の 育成や 雑談から 生まれる 発想が 失われがちな こと', ['通勤の 負担が 増える こと', '介護と 両立できない こと', '費用が かかりすぎる こと'], 'Masalah menurut B.', '新入社員の育成や、雑談から生まれる発想が失われがち'),
    ('AとBの 違いは どれか。', 'Aは 出社に 戻る べきでないと 考え、Bは 定期的な 出社も 必要だと 考える', ['AもBも 出社を 全面的に 求める', 'Aは 出社を 求め、Bは テレワークだけを 求める', 'AもBも テレワークに 反対する'], 'A tak kembali; B perlu berkala.', 'A：戻るべきではない / B：定期的に出社…欠かせない')]),
 X('<b>【A】</b><br>外国人労働者の受け入れを拡大するべきだ。少子高齢化で労働力が不足している日本では、外国人の力なしに産業は維持できない。受け入れ体制を整えれば、双方に利益がある。<br><br><b>【B】</b><br>外国人労働者を労働力としてのみ見る姿勢には問題がある。言語や生活習慣の違いから、孤立や差別に直面する人は多い。受け入れを拡大するなら、生活支援や教育など、共に暮らす社会の仕組みを同時に整える必要がある。',
   '[A] Penerimaan pekerja asing harus diperluas. Di Jepang yang kekurangan tenaga kerja akibat penuaan dan penurunan kelahiran, industri tak bisa dipertahankan tanpa tenaga orang asing. Bila sistem penerimaan ditata, kedua pihak untung.\n[B] Sikap memandang pekerja asing hanya sebagai tenaga kerja bermasalah. Banyak yang menghadapi isolasi dan diskriminasi karena perbedaan bahasa dan kebiasaan. Bila penerimaan diperluas, perlu serentak menata sistem masyarakat hidup bersama seperti dukungan hidup dan pendidikan.',
   [('Bが 問題だと 考える 姿勢は どれか。', '外国人を 労働力としてのみ 見る 姿勢', ['外国人を 受け入れない 姿勢', '日本語を 教える 姿勢', '生活を 支援する 姿勢'], 'Sikap bermasalah menurut B.', '外国人労働者を労働力としてのみ見る姿勢には問題'),
    ('AとBに 共通して いる 考えは どれか。', '受け入れ体制の 整備が 必要だと 考えて いる', ['受け入れを 縮小する べきだと 考えて いる', '日本人の 労働力で 足りると 考えて いる', '外国人は 差別されて いないと 考えて いる'], 'Kesamaan: sistem penerimaan.', 'A：受け入れ体制を整えれば / B：仕組みを同時に整える必要')]),
]
