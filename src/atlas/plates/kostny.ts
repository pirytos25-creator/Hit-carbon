import type { AtlasPlateContent } from '../types';

/**
 * Układ kostny (agent 10, faza 1b). Typ treści wg modelu (§4, punkt 10): KARTA z jedną liczbą obciążenia
 * (pionowa siła reakcji podłoża) i czasem kontaktu stopy. Rendery: blender/atlas/plate_kostny.py.
 * Jasność kości w sprincie to ilustracja drogi obciążenia w 3 stopniach, nie pomiar (decyzja Dyrygenta K1).
 * Statusy wg docs/atlas_audyt/fakty_kostny.md (numery # w komentarzach). Wartości zmienione po audycie K2 są 'draft'.
 * „Sprint” = koniec 45 s szybkiego biegu przy ok. 88% VO₂max (model §3.7). Siły podłoża pochodzą z biegu ze stałą
 * prędkością 3–5 m/s (Munro 1987), dlatego każda liczba ma `protocolMismatch`.
 * Kolor: token --sys-bone bez zmian, do czasu decyzji integratora w palette.json.
 */
export const KOSTNY: AtlasPlateContent = {
  id: 'kostny',
  titlePl: 'Układ kostny',
  subtitlePl: 'Ile waży każdy krok: nacisk podłoża na stopę',
  colorVar: '--sys-bone',
  views: ['front', 'side', 'detail'],
  viewTitlesPl: {
    front: 'Widok z przodu',
    side: 'Widok z boku',
    detail: 'Przekrój kości udowej (wnętrze: schemat)',
  },
  summary: {
    rest: 'W staniu kości nóg, miednica i kręgosłup podpierają ciężar ciała rozłożony na obie stopy. Cały szkielet jest na rysunku jednakowo przygaszony.',
    sprint:
      'W szybkim biegu stopa przy każdym kroku przyjmuje nacisk podłoża w szczycie ok. 2,5–2,7 razy większy niż ciężar ciała, a dotyka podłoża tylko ok. 0,24–0,27 s. Na rysunku wyróżniono kości, które dźwigają ciężar ciała: kości nóg, miednicę i kręgosłup lędźwiowy (ilustracja, nie pomiar). Gęstość kości nie zmienia się po jednym treningu: kość przebudowuje się tygodniami i miesiącami.',
  },
  summaryReferenceIds: { sprint: ['munro_1987', 'sims_martin_2014', 'eriksen_2010'] },
  summaryStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // fakty_koncowe_C_reszta_i_kontrola.md: Munro 1987 tab. 2 i 3, Sims i Martin 2014
  protocolNotePl:
    'Sprint = koniec 45 s szybkiego biegu przy ok. 88% VO₂max (to ok. 3,0–3,7 m/s, szacunek). Siły podłoża zmierzono w pojedynczych krokach biegu ze stałą prędkością 3–5 m/s, w stanie wypoczętym, nie w naszym interwale.',
  protocolNoteStatus: 'checked_agent', // fakty_kontrola_koncowa.md, cz. 1a
  labels: [
    // --- Widok z przodu: prawa strona ciała (po lewej na obrazie), dwa podpisy z lewej strony ciała ---
    {
      anchor: 'femur',
      view: 'front',
      namePl: 'Kość udowa',
      nameLat: 'femur',
      role: { rest: 'Kość uda: łączy staw kolanowy z biodrowym', sprint: 'Kość uda: łączy staw kolanowy z biodrowym' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'tibia',
      view: 'front',
      namePl: 'Kość piszczelowa',
      nameLat: 'tibia',
      role: { rest: 'Główna kość podudzia, na niej opiera się udo', sprint: 'Główna kość podudzia, na niej opiera się udo' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'hip_bone',
      view: 'front',
      namePl: 'Kość miedniczna',
      nameLat: 'os coxae',
      role: { rest: 'Łączy nogi z kręgosłupem', sprint: 'Przekazuje nacisk z nogi na kręgosłup' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'knee',
      view: 'front',
      namePl: 'Staw kolanowy (łąkotki)',
      nameLat: 'articulatio genus, menisci',
      role: { rest: 'Chrząstka rozkłada nacisk w stawie', sprint: 'Łąkotki rozkładają nacisk przy każdym lądowaniu' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'patella',
      view: 'front',
      namePl: 'Rzepka',
      nameLat: 'patella',
      role: { rest: 'Kość w ścięgnie mięśnia czworogłowego', sprint: 'Kość w ścięgnie mięśnia czworogłowego' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'fibula',
      view: 'front',
      namePl: 'Kość strzałkowa',
      nameLat: 'fibula',
      role: { rest: 'Cienka kość boczna podudzia', sprint: 'Cienka kość boczna podudzia' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'humerus',
      view: 'front',
      namePl: 'Kość ramienna',
      nameLat: 'humerus',
      role: { rest: 'Nie dźwiga ciężaru ciała', sprint: 'Nie dźwiga ciężaru ciała (na rysunku przygaszona)' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    // --- Widok z boku (kamera po prawej stronie ciała) ---
    {
      anchor: 'lumbar',
      view: 'side',
      namePl: 'Kręgosłup lędźwiowy',
      nameLat: 'vertebrae lumbales L1–L5',
      role: { rest: 'Dźwiga górną część ciała', sprint: 'Dźwiga górną część ciała, amortyzuje kroki' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'disc',
      view: 'side',
      namePl: 'Krążek międzykręgowy',
      nameLat: 'discus intervertebralis L4–L5',
      role: { rest: 'Chrząstka między kręgami', sprint: 'Chrząstka między kręgami: amortyzuje nacisk' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'calcaneus',
      view: 'side',
      namePl: 'Kość piętowa',
      nameLat: 'calcaneus',
      role: { rest: 'Największa kość stopy, tworzy piętę', sprint: 'Największa kość stopy, tworzy piętę' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'sacrum',
      view: 'side',
      namePl: 'Kość krzyżowa',
      nameLat: 'os sacrum',
      role: { rest: 'Łączy kręgosłup z miednicą', sprint: 'Łączy kręgosłup z miednicą' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'femoral_head',
      view: 'side',
      namePl: 'Głowa kości udowej',
      nameLat: 'caput femoris',
      role: { rest: 'Staw biodrowy', sprint: 'Staw biodrowy: przez niego nacisk przechodzi na miednicę' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'talus',
      view: 'side',
      namePl: 'Kość skokowa',
      nameLat: 'talus',
      role: { rest: 'Łączy podudzie ze stopą', sprint: 'Łączy podudzie ze stopą' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    // --- Zbliżenie: przekrój bliższego końca prawej kości udowej (obrys z Z-Anatomy, wnętrze: schemat) ---
    {
      anchor: 'd_cortex',
      view: 'detail',
      namePl: 'Istota zbita',
      nameLat: 'substantia compacta',
      role: { rest: 'Gruba, twarda ściana trzonu', sprint: 'Gruba, twarda ściana trzonu (schemat)' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_spongy',
      view: 'detail',
      namePl: 'Istota gąbczasta (beleczki)',
      nameLat: 'substantia spongiosa',
      role: {
        rest: 'Beleczki w pasmach, w oczkach szpik czerwony',
        sprint: 'Pasma beleczek biegną zgodnie z kierunkami obciążeń (schemat)',
      },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_marrow',
      view: 'detail',
      namePl: 'Jama szpikowa',
      nameLat: 'cavitas medullaris',
      role: { rest: 'U dorosłych wypełniona szpikiem żółtym (tłuszczowym)', sprint: 'U dorosłych wypełniona szpikiem żółtym (tłuszczowym)' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_head',
      view: 'detail',
      namePl: 'Głowa kości udowej',
      nameLat: 'caput femoris',
      role: { rest: 'Cienka warstwa zbita na powierzchni', sprint: 'Cienka warstwa zbita na powierzchni' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_trochanter',
      view: 'detail',
      namePl: 'Krętarz większy',
      nameLat: 'trochanter major',
      role: { rest: 'Przyczep mięśni pośladkowych średniego i małego', sprint: 'Przyczep mięśni pośladkowych średniego i małego' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_compressive',
      view: 'detail',
      namePl: 'Pasmo beleczek ściskanych',
      role: { rest: 'Od ściany przyśrodkowej szyjki do głowy', sprint: 'Od ściany przyśrodkowej szyjki do głowy' },
      tier: 'student',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_tensile',
      view: 'detail',
      namePl: 'Pasmo beleczek rozciąganych',
      role: { rest: 'Łuk od ściany bocznej nad szyjką do głowy', sprint: 'Łuk od ściany bocznej nad szyjką do głowy' },
      tier: 'student',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
  ],
  metrics: [
    // --- Poziom podstawowy: zawężone do wzorca 88% VO₂max (ok. 3,0–3,7 m/s = wiersze 3,00–3,75 m/s tabel Munro) ---
    {
      labelPl: 'Szczyt nacisku podłoża na stopę',
      rest: '—',
      sprint: 'ok. 2,5–2,7',
      unit: '× masa ciała',
      referenceIds: ['munro_1987'],
      evidenceLevel: 'established_human',
      notePl:
        'To siła, z jaką podłoże naciska na stopę (zmierzona płytą pomiarową), a nie siła wewnątrz kości. Wartość dla tempa podobnego do naszego interwału; przy szybszym biegu nieco więcej.',
      status: 'checked_agent', // fakty_koncowe_C_reszta_i_kontrola.md; decyzja Dyrygenta c)
      restStatus: 'anatomy',
      measuredAt: 'jeden krok biegu, 35–50% czasu kontaktu stopy (szczyt opisany u lądujących na pięcie, 17 z 20 badanych)',
      protocolMismatch:
        'pojedyncze kroki biegu ze stałą prędkością (wybieraną samodzielnie) po płycie pomiarowej, w stanie wypoczętym, nie pod koniec 45 s pracy; badanie nie podaje % VO₂max; 20 mężczyzn ok. 25 lat biegających rekreacyjnie; wzorzec 88% VO₂max ≈ 3,0–3,7 m/s (szacunek z równania biegu ACSM), czyli dolna część zakresu 3–5 m/s',
      conversionNote: 'Munro 1987, tab. 3: thrust maximum 2,51 / 2,56 / 2,62 / 2,67 BW dla 3,00 / 3,25 / 3,50 / 3,75 m/s, zaokrąglone do 2,5–2,7.',
      quote:
        'The thrust peak, which is the second peak in the vertical GRF-histories of rear-foot strikers, generally occurred between 35 and 50% of the total stance time and its magnitude increased (p < 0.001) from 2.5 BW at 3.0 m s-1 to 2.8 BW at 5.0 m s-1.',
      locator: 'Munro 1987, s. 151, akapit „Thrust maximum”; tab. 3, wiersze 3,00–3,75 m/s (tabele sprawdzone na publicznej kopii skanu)',
      tier: 'primary',
    },
    {
      labelPl: 'Kontakt stopy z podłożem',
      rest: '—',
      sprint: 'ok. 0,24–0,27',
      unit: 's na krok',
      referenceIds: ['munro_1987'],
      evidenceLevel: 'established_human',
      notePl: 'Dla tempa podobnego do naszego interwału. Im szybszy bieg, tym krótszy kontakt.',
      status: 'checked_agent', // fakty_koncowe_C_reszta_i_kontrola.md; decyzja Dyrygenta c)
      restStatus: 'anatomy',
      measuredAt: 'jeden krok biegu (siła pionowa > 16 N)',
      protocolMismatch:
        'pojedyncze kroki biegu ze stałą prędkością (wybieraną samodzielnie) po płycie pomiarowej, w stanie wypoczętym, nie pod koniec 45 s pracy; badanie nie podaje % VO₂max; wzorzec 88% VO₂max ≈ 3,0–3,7 m/s (szacunek), czyli dolna część zakresu 3–5 m/s',
      conversionNote: 'Munro 1987, tab. 2: 270 / 258 / 247 / 238 ms dla 3,00 / 3,25 / 3,50 / 3,75 m/s = ok. 0,24–0,27 s.',
      quote:
        'In the present investigation, stance time, defined as the period of time during which the vertical GRF exceeded 16 N, decreased (p < 0.001) from 270 to 198 ms as the running speed increased (Table 2).',
      locator: 'Munro 1987, s. 148–149, akapit „Stance time”; tab. 2 (s. 149), wiersze 3,00–3,75 m/s (tabele sprawdzone na publicznej kopii skanu)',
      tier: 'primary',
    },
    {
      labelPl: 'Przebudowa kości (po tygodniach)',
      rest: '—',
      sprint: 'cały cykl ok. 120–200',
      unit: 'dni',
      referenceIds: ['eriksen_2010', 'sims_martin_2014'],
      evidenceLevel: 'established_human',
      notePl:
        'Po tygodniach i miesiącach: kość przebudowuje się w miejscach obciążanych. Jeden cykl trwa ok. 4–7 miesięcy (w kości zbitej krócej, w gąbczastej dłużej), więc jeden trening nie zmienia gęstości kości.',
      status: 'checked_agent', // fakty_koncowe_C_reszta_i_kontrola.md: Eriksen 2010, Sims i Martin 2014
      restStatus: 'anatomy',
      measuredAt: 'adaptacja tygodni i miesięcy, nie efekt jednego sprintu',
      protocolMismatch: 'zdrowa dorosła kość człowieka, ogólnie (przegląd), bez związku z konkretnym treningiem',
      conversionNote: 'Kość zbita: mediana 120 dni; kość gąbczasta: ok. 200 dni; 120–200 dni ≈ 4–7 miesięcy.',
      quote:
        'In cancellous bone remodeling occurs on the surface of trabeculae and lasts about 200 days in normal bone. […] In normal bone the duration of the remodeling cycle in cortical is shorter than in cancellous bone with a median of 120 days [6].',
      locator:
        'Eriksen 2010, rozdz. „The bone remodeling cycle”, akapit 2 (przebudowa jako adaptacja do obciążeń: Sims i Martin 2014, Introduction, akapit 2)',
      tier: 'primary',
    },
    // --- Poziom rozszerzony: pełne zakresy z badania (3–5 m/s) i porównanie ze sprintem maksymalnym ---
    {
      labelPl: 'Szczyt nacisku podłoża, cały zakres badania (3–5 m/s)',
      rest: '—',
      sprint: '2,5–2,8',
      unit: '× masa ciała',
      referenceIds: ['munro_1987'],
      evidenceLevel: 'established_human',
      notePl:
        'To siła, z jaką podłoże naciska na stopę (zmierzona płytą pomiarową), a nie siła wewnątrz kości. W biegu 3–5 m/s, im szybciej, tym więcej.',
      status: 'checked_agent', // fakty_kostny.md #7, #8
      restStatus: 'anatomy',
      measuredAt: 'jeden krok biegu, 35–50% czasu kontaktu stopy',
      protocolMismatch:
        'pojedyncze kroki biegu ze stałą prędkością (wybieraną samodzielnie, 2,5–5,5 m/s; normy dla 3–5 m/s) po płycie pomiarowej, w stanie wypoczętym; badanie nie podaje % VO₂max; górna część zakresu (4–5 m/s) jest szybsza niż wzorzec 88% VO₂max',
      quote:
        'The thrust peak, which is the second peak in the vertical GRF-histories of rear-foot strikers, generally occurred between 35 and 50% of the total stance time and its magnitude increased (p < 0.001) from 2.5 BW at 3.0 m s-1 to 2.8 BW at 5.0 m s-1.',
      locator: 'Munro 1987, s. 151, akapit „Thrust maximum”; tab. 3',
      tier: 'student',
    },
    {
      labelPl: 'Kontakt stopy, cały zakres badania (3–5 m/s)',
      rest: '—',
      sprint: '0,20–0,27',
      unit: 's na krok',
      referenceIds: ['munro_1987'],
      evidenceLevel: 'established_human',
      notePl: 'Im szybszy bieg, tym krótszy kontakt (0,27 s przy 3 m/s, 0,20 s przy 5 m/s).',
      status: 'checked_agent', // fakty_kostny.md #9
      restStatus: 'anatomy',
      measuredAt: 'jeden krok biegu (siła pionowa > 16 N)',
      conversionNote: '270–198 ms = 0,27–0,20 s',
      protocolMismatch:
        'pojedyncze kroki biegu ze stałą prędkością po płycie pomiarowej, w stanie wypoczętym; badanie nie podaje % VO₂max; górna część zakresu jest szybsza niż wzorzec 88% VO₂max',
      quote:
        'In the present investigation, stance time, defined as the period of time during which the vertical GRF exceeded 16 N, decreased (p < 0.001) from 270 to 198 ms as the running speed increased (Table 2).',
      locator: 'Munro 1987, s. 148–149, akapit „Stance time”; tab. 2',
      tier: 'student',
    },
    {
      labelPl: 'Szczyt uderzenia piętą',
      rest: '—',
      sprint: '1,6–2,3',
      unit: '× masa ciała',
      referenceIds: ['munro_1987'],
      evidenceLevel: 'established_human',
      notePl: 'Pierwszy, krótki szczyt siły u osób lądujących na pięcie (w butach do biegania). W tempie naszego interwału bliżej dolnej granicy.',
      status: 'checked_agent', // fakty_kostny.md #12
      restStatus: 'anatomy',
      measuredAt: '6–17% czasu kontaktu stopy',
      protocolMismatch:
        'pojedyncze kroki biegu ze stałą prędkością 3–5 m/s po płycie pomiarowej, w stanie wypoczętym; badanie nie podaje % VO₂max',
      quote:
        'In the present investigation in which the subjects wore their own jogging shoes, the impact peak generally occurred between 6 and 17% of the total stance time and its magnitude increased from 1.6 body weight (BW) at 3.0 m s-1 to 2.3 BW at 5.0 m s-1.',
      locator: 'Munro 1987, s. 151, akapit „Impact peak”; tab. 3',
      tier: 'student',
    },
    {
      labelPl: 'Dla porównania: sprint na maksa, kontakt stopy',
      rest: '—',
      sprint: 'ok. 0,11',
      unit: 's na krok',
      referenceIds: ['weyand_2000'],
      evidenceLevel: 'established_human',
      notePl: 'Przy maksymalnej prędkości stopa dotyka podłoża ok. dwa razy krócej niż w szybkim biegu.',
      status: 'checked_agent', // fakty_kostny.md #13 (z poprawionym cytatem), #14
      restStatus: 'anatomy',
      measuredAt: 'kroki przy prędkości maksymalnej (bieżnia poziomo)',
      protocolMismatch: 'sprint z maksymalną prędkością (średnio 9,25 m/s) na bieżni z płytą pomiarową, 5 osób',
      conversionNote: '0,107 ± 0,003 s zaokrąglone do 0,11 s',
      quote: 'Level, 0° | 0.350 ± 0.007 | 0.107 ± 0.003* | 0.457 ± 0.005',
      locator: 'Weyand 2000, tab. 2 (t sw, t c, t str w s; średnia ± SE, 5 osób), wiersz „Level, 0°”; 9,25 m/s: tab. 1',
      tier: 'student',
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Wnętrze kości w przekroju: schemat. W widoku z boku pominięto prawą kończynę górną (zasłaniała miednicę). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
