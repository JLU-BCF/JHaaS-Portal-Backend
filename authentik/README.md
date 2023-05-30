Für JHaaS neben den Flow Exports außerdem benötigt:

```
Scope Mapping:
  user-attributes:
    (s. Bild)

Provider:
  JHaaS Portal anlegen
  JHaaS Flows setzen
  user-attributes scope zusätzlich setzen
  Subject based on UUID setzen

Application:
  JHaaS Portal anlegen
  mit passender Launch Url auf
  /api/auth/oidc/login

Tenants:
  Entweder default anpassen oder neuen Anlegen
    Default Flows auf JHaaS Flows setzen
    Nach Wunsch customizen
```
