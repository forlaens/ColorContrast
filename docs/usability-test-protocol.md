# Modereret brugertest af Color contrast checker

## Formål

Testen skal afgøre, om mennesker uden vejledning kan vælge det rigtige værktøj, gennemføre begge hovedopgaver og skelne mellem et aktuelt, ugyldigt og forældet resultat.

Testen måler adfærd og forståelse. Den er ikke en præsentation af designet, og testlederen må ikke forklare brugerfladen under opgaverne.

## Deltagere

Rekruttér fem personer med følgende spredning:

- mindst to personer, der ikke arbejder professionelt med webtilgængelighed
- mindst én designer eller indholdsproducent
- mindst én udvikler eller teknisk specialist
- hvis muligt én person, der bruger hjælpemidler eller har et relevant adgangsbehov

Registrér kun et anonymt deltager-ID, erfaringsniveau og relevante testforhold. Undlad navne og andre unødvendige personoplysninger.

## Opsætning

- Brug den byggede version af appen i en ren browsersession.
- Start hver deltager på `/` med lyst tema og engelsk sprog, medmindre deltageren selv vælger andet.
- Lad deltageren bruge sin foretrukne mus, touch, tastatur eller hjælpeteknologi.
- Optag ikke skærm eller lyd uden udtrykkeligt samtykke.
- Notér tid, fejl, tilbageveje, spontane kommentarer og steder, hvor deltageren stopper op.

## Introduktion til deltageren

> Vi tester værktøjet, ikke dig. Tænk gerne højt. Jeg hjælper ikke med selve opgaverne, men sig til, hvis noget teknisk forhindrer testen.

## Opgaver

### Opgave 1: Vælg det rigtige værktøj

> Du vil kontrollere, om mørk tekst kan bruges på en lys baggrund. Vis mig, hvor du vil begynde.

Bestået når deltageren vælger “Check two colors” uden hjælp.

### Opgave 2: Kontrollér og ret to farver

> Kontrollér `#707070` som tekstfarve på `#ffffff`. Forklar derefter med dine egne ord, hvad resultatet betyder. Skriv til sidst `#70x070` i tekstfarven, og fortæl mig, om det gamle resultat stadig gælder.

Bestået når deltageren:

- indtaster begge farver
- kan udpege ratioen og konklusionen
- forstår, at stor tekst og grafik kan bestå ved lavere ratio end normal tekst
- ser den lokale fejl og ikke opfatter det skjulte resultat som aktuelt

### Opgave 3: Find problemområder i et billede

> Gå tilbage og kontrollér, hvor sort normal tekst kan være svær at se i testbilledet. Vælg selv den vej, der virker naturlig.

Giv deltageren testbilledet som en lokal fil. Bestået når deltageren:

- vender tilbage til opgavevalget og vælger billedværktøjet
- indlæser billedet via filvalg, drop eller paste
- genkender den valgte farve og kriteriet
- aktiverer “Find problem areas”
- kan forklare procenten og markeringernes betydning

### Opgave 4: Skeln mellem resultattilstande

> Vis originalbilledet. Gå tilbage til problemområderne. Skift derefter kriteriet til grafik, og fortæl mig, om det viste resultat stadig gælder. Opdatér resultatet og fjern markeringerne uden at fjerne billedet.

Bestået når deltageren:

- bruger “Original” og “Problem areas” korrekt
- forstår, at resultatet bliver forældet efter kriterieskift
- bruger “Update result”
- bruger “Remove markings” uden at vælge et nyt billede

## Afsluttende spørgsmål

Stil spørgsmålene efter alle opgaver:

1. Hvad forventede du, før du valgte hvert af de to værktøjer?
2. Hvilket sted krævede mest eftertanke?
3. Var der et resultat eller en knap, du var usikker på?
4. Hvad ville du ændre først?

## Observationsark

| Deltager | Opgave 1 | Opgave 2 | Opgave 3 | Opgave 4 | Kritisk misforståelse | Vigtigste observation |
|---|---|---|---|---|---|---|
| P1 | Ikke testet | Ikke testet | Ikke testet | Ikke testet | Ikke testet | |
| P2 | Ikke testet | Ikke testet | Ikke testet | Ikke testet | Ikke testet | |
| P3 | Ikke testet | Ikke testet | Ikke testet | Ikke testet | Ikke testet | |
| P4 | Ikke testet | Ikke testet | Ikke testet | Ikke testet | Ikke testet | |
| P5 | Ikke testet | Ikke testet | Ikke testet | Ikke testet | Ikke testet | |

Brug `Bestået`, `Bestået med tøven` eller `Ikke bestået` i opgavekolonnerne. En kritisk misforståelse er, at en deltager opfatter et ugyldigt eller forældet resultat som aktuelt, eller forveksler “Remove markings” med “Choose another image”.

## Acceptkriterier

Designet kan godkendes til den definerede målgruppe, når:

- mindst fire af fem deltagere uden hjælp vælger korrekt værktøj i opgave 1 og 3
- mindst fire af fem gennemfører hvert hovedflow
- ingen opfatter et ugyldigt eller forældet resultat som aktuelt
- ingen forveksler “Remove markings” med “Choose another image”

Hvis et kriterium ikke bestås, registrér den observerede adfærd, det konkrete UI-element og den mindste sandsynlige rettelse. Gentest den berørte opgave efter ændringen.

## Resultat

Status: **Ikke gennemført**

Testdato: _Ikke fastlagt_

Samlet konklusion: _Udfyldes efter fem gennemførte sessioner._
