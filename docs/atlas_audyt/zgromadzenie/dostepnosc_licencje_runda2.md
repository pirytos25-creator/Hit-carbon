# Zgromadzenie, runda 2: Strażnik dostępności i licencji

## (a) Z czym się nie zgadzam
- **Architekt, „`check:atlas` przechodzi, ΔE min. 15,3”.** To prawda tylko dla kolorów głównych. Strzałki rysuje się jasnymi wariantami, których walidator nie sprawdza. W jednym widoku 3 plansze mają przy daltonizmie ΔE poniżej 15: powłokowy 12,3, moczowy 14,4 i 14,5, pokarmowy 13,1 (runda 1, p. 2). Zielony wynik walidatora nie oznacza więc, że rozróżnienie kolorów jest spełnione.
- **Architekt p. 3: brak `atl_source` w oddechowym „psuje wyjątek NC dla HuBMAP”.** Nazwy HuBMAP (`VH_M_*`, `3d-vh-m-*`) nie pasują do żadnego wzorca `NC_BLOCKLIST`, więc dziś nie grozi to wyciekiem NC. To problem pochodzenia i przyszłych wiązań, a nie licencji. Waga z mojej strony: niska.
- **Architekt, uwaga 1 do planu Reżysera: „pliki BY-SA i BY trzymać osobno”.** Licencja tego nie wymaga. Materiał CC BY 4.0 wolno włączyć do utworu na CC BY-SA 4.0. Warunek jest inny: całość wychodzi na BY-SA i ma atrybucję każdego źródła. Rozdzielenie plików to wygoda, a nie obowiązek. Ważniejsze jest pole `source` i `license` przy każdej siatce (zob. b).
- **Dydaktyk p. 9: bursztynowe dopiski są „wyraźniejsze niż liczba”.** Z kontrastem nie ma tu problemu (amber-200: 14–16:1). Zgadzam się na skrócenie, ale nie na przygaszenie koloru poniżej 4,5:1.

## (b) Najważniejsze z cudzych list (moja perspektywa)
1. **Anatom p. 3 i p. 1**: strzałki nerwowego zlewają się w jedną drogę, a strzałka mózgu biegnie po fałszywym przebiegu. Ten sam problem co mój p. 2: strzałka bez podpisu i legendy niesie znaczenie tylko kształtem i kolorem.
2. **Architekt p. 2 i p. 5**: `bindings.json` z polami `source` i `license` przy każdym obiekcie oraz bramka NC w Node dla GLB. Bez tego E3 (GLB w przeglądarce) to nowa, niepilnowana droga wycieku NC i braków w atrybucji.
3. **Dydaktyk p. 15 i p. 10**: przełącznik stanu na telefonie dopiero po ok. 2000–3000 px oraz skróty bez rozwinięcia. To także dostępność (WCAG 3.1.4 i orientacja na stronie).
4. **Strażnik faktów p. 5**: reguła ostatniej rundy i wyjątki a–e wymagają zgody użytkownika.

## (c) 5 poprawek „must-have” przed przyjęciem (całe zgromadzenie, według wagi)
1. **Kontrast tekstu na kolorze układu:** „Sprint HIIT” i numery pinezek. Moczowy ma 2,97:1, krwionośny 4,04:1, mięśniowy 4,35:1. Rozwiązanie: tekst dobrany dla każdego układu i nowy test w walidatorze (moja runda 1, p. 1).
2. **Strzałki z legendą (`labelPl`) i rozróżnialne nie tylko kolorem.** Rozdzielić strzałki nerwowego, poprawić przebieg strzałki mózgu albo dopisać „schemat”. Walidator ma sprawdzać jasne warianty par w jednym widoku (moja runda 1, p. 2; anatom p. 1 i p. 3).
3. **Sprzeczne lub zakazane treści w poziomie Podstawowym:** „7–8×” na pokarmowym, wbrew decyzji a) (dydaktyk p. 5), sprzeczność glukozy na mózgu (anatom p. 2) i błąd składni „nie są pokazywane” (dydaktyk p. 14).
4. **Telefon i klawiatura:**
   - spacja nie przełącza stanu, a skrót S działa tylko z fokusem na planszy (WCAG 2.1.4);
   - link „← Podróż filmowa” widoczny na telefonie;
   - przełącznik stanu przyklejony nad obrazem (dydaktyk p. 15).
5. **Czytelność i kompletność licencji:**
   - stopka licencji i menu co najmniej 14 px, `slate-500` zamienić na `slate-400`;
   - w stopce odnośniki do licencji i informacja o modyfikacji modeli;
   - `VH_F_Urinary_Bladder` dopisać do `ATLAS_ASSETS.md` §2 i do `LICENSES_AND_ASSETS.md` §6.
