// Frequent irregular Swedish forms → dictionary form (research R2 step 5b). Used only when the
// dictionary form is in the learner's ground.

const TABLE = {
  vara: 'är var varit', ha: 'har hade haft', göra: 'gör gjorde gjort', gå: 'går gick gått', komma: 'kommer kom kommit',
  se: 'ser såg sett', säga: 'säger sa sade sagt', veta: 'vet visste vetat', få: 'får fick fått', ta: 'tar tog tagit',
  ge: 'ger gav gett givit', vilja: 'vill ville velat', kunna: 'kan kunde kunnat', ska: 'skulle', bli: 'blir blev blivit',
  stå: 'står stod stått', sitta: 'sitter satt suttit', ligga: 'ligger låg legat', sova: 'sover sov sovit', äta: 'äter åt ätit',
  dricka: 'dricker drack druckit', skriva: 'skriver skrev skrivit', springa: 'springer sprang sprungit', flyga: 'flyger flög flugit',
  heta: 'heter hette hetat', sätta: 'sätter satte', gråta: 'gråter grät gråtit', le: 'ler log lett', bära: 'bär bar burit',
  välja: 'väljer valde valt', förstå: 'förstår förstod förstått', göra_: '', lägga: 'lägger la lade lagt',
  gammal: 'gamla äldre äldst', liten: 'lilla litet små mindre minst', bra: 'bättre bäst', god: 'gott goda', stor: 'större störst',
  ung: 'yngre yngst', lång: 'längre längst', många: 'fler flest', mycket: 'mer mest', få_: '',
  man: 'män männen', bok: 'böcker böckerna', stad: 'städer städerna', land: 'länder länderna', natt: 'nätter nätterna',
  min: 'mitt mina', din: 'ditt dina', sin: 'sitt sina', vår: 'vårt våra', er: 'ert era',
  ingen: 'inget inga', någon: 'något några', annan: 'annat andra', vilken: 'vilket vilka', hel: 'helt hela', egen: 'eget egna',
  väder: 'vädret', fågel: 'fåglar fåglarna fågeln', vatten: 'vattnet', himmel: 'himlen', sommar: 'somrar sommaren',
  människa: 'människor', öga: 'ögon', barn: 'barnen', dotter: 'döttrar', bror: 'bröder', mamma: 'mammor', pappa: 'pappor',
};

export const IRREGULAR = new Map();
for (const [lemma, forms] of Object.entries(TABLE)) {
  for (const form of forms.split(' ').filter(Boolean)) {
    const key = lemma.replace(/_$/, '');
    IRREGULAR.set(form, [...(IRREGULAR.get(form) || []), key]);
  }
}
