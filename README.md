# OSLO Zoekmachine Frontend

De zoekmachine voor OSLO (Open Standaarden voor Linkende Organisaties) bestaat uit 3 delen:

- Elasticsearch
- [NodeJs backend](https://github.com/ddvlanck/OSLO-SearchEngine-Backend/blob/master/README.md)
- **Vue frontend**

De frontend van de zoekmachine zit in deze repository en werd ontwikkeld in Vue met Webcomponenten versie 3. Deze componenten werden als private modules gepubliceerd op NPM. Dit zorgt ervoor dat de gebruiker in NPM tot de organisatie **govflanders** moet behoren om deze frontend lokaal te kunnen gebruiken.

Indien de gebruiker tot bovenstaande organisatie behoort, dan dient hij te navigeren naar de directory, vervolgens in te loggen bij NPM door middel van het commando `npm login`. Verder moet ook de inhoud van het bestand `.npmrc` leeggemaakt worden, anders zal er telkens een error getoond worden.
- Het .npmrc-bestand is nodig om een docker image te kunnen maken en toegang te krijgen tot node modules uit een private registry.

## Docker

De gebruiker kan er ook voor kiezen om de frontend te draaien via Docker. Hiertoe moet hij eerst een docker image maken van deze repository:
```
> docker build -t search_engine_frontend --build-arg NPM_TOKEN=XXX .
```

Ook hier dient de gebruiker tot de NPM organisatie **govflanders** behoren, want om een docker image van de frontend te bouwen dient de gebruiker een NPM-token mee te geven aan het commando (vervang XXX door je eigen NPM-token).


