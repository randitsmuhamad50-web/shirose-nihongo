# -*- coding: utf-8 -*-
T3 = [
 ("彼は（　　　）責任者として、全体を取りまとめた。","総",["全","諸","各"],"Dia mengoordinasi semuanya sebagai penanggung jawab umum.","総責任者."),
 ("彼女は（　　　）名度の高い女優だ。","知",["有","名","高"],"Dia aktris yang terkenal luas.","知名度."),
]
def _ok(r): return len(r[2])==3 and r[1] not in r[2]
T3=[r for r in T3 if _ok(r) and r[0].startswith("彼は")]
