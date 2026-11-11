# -*- coding: utf-8 -*-
M3 = [
 ("彼女は孤立した同僚の（　　　）になろうと努めた。","力",["敵","邪魔","足"],"Dia berusaha menjadi penopang rekan yang terkucil.","力になる."),
 ("交渉は（　　　）に乗り上げ、解決の見通しが立たない。","暗礁",["岩場","浅瀬","座礁"],"Perundingan terkandas dan tak ada harapan solusi.","暗礁に乗り上げる."),
 ("この制度の（　　　）を、早急に見直す必要がある。","不備",["不足","不調","不満"],"Kekurangan sistem ini perlu segera ditinjau.","制度の不備."),
 ("彼は会社の（　　　）を担う若手として期待されている。","将来",["将軍","将棋","将来像"],"Dia diharapkan sebagai pemuda penopang masa depan perusahaan.","将来を担う."),
 ("景気の（　　　）に伴い、失業率も上がった。","悪化",["悪用","悪循環","悪意"],"Seiring memburuknya ekonomi, tingkat pengangguran naik.","景気の悪化."),
]
def _ok(r): return len(r[2])==3 and r[1] not in r[2]
_drop=("彼は会社の","彼女は孤立","この制度の")
M3=[r for r in M3 if _ok(r) and not any(x in r[0] for x in _drop)]
