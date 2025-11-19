# Core Banking API

API REST pour un système bancaire de base, implémentant les fonctionnalités essentielles de gestion de compte bancaire (dépôts, retraits, consultation du solde et relevé de compte).

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Exécution](#exécution)
- [Documentation API](#documentation-api)
- [Tests](#tests)
- [Architecture](#architecture)
- [Choix techniques](#choix-techniques)
- [Structure du projet](#structure-du-projet)

## Prérequis

- **Node.js** >= 18.x
- **yarn**
- **PostgreSQL** >= 17.x

## Installation

1. **Cloner le dépôt** (si applicable) :

```bash
git clone https://github.com/kouameYao/novas-test-core-api.git
cd novas-test-core-api
```

2. **Installer les dépendances** :

```bash
yarn install
```

3. **Configurer la base de données** :
   - Créer une base de données PostgreSQL
   - Configurer la variable d'environnement `DATABASE_URL` (voir section Configuration)
   - DATABASE_URL="postgresql://username:password@localhost:5432/novascend_bank_api?schema=public"

4. **Générer le client Prisma** :

```bash
npx prisma generate
```

5. **Exécuter les migrations** :

```bash
npx prisma migrate deploy
```

## Configuration

### Variables d'environnement

L'application utilise les variables d'environnement suivantes :

| Variable         | Description                    | Valeur par défaut                                                                |
| ---------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| `DATABASE_URL`   | URL de connexion PostgreSQL    | `postgresql://postgres:postgres@localhost:5432/novascend_bank_api?schema=public` |
| `JWT_SECRET`     | Clé secrète pour JWT           | `your-secret-key-change-in-production`                                           |
| `JWT_EXPIRES_IN` | Durée de validité du token JWT | `24h`                                                                            |
| `PORT`           | Port d'écoute de l'API         | `8080`                                                                           |

### Configuration de la base de données

Vous devez placer configurer la base de données de deux façons :

**Variable d'environnement complète**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
```

## Exécution

### Mode développement

```bash
yarn start:dev
```

L'application démarre sur `http://localhost:8080` (ou le port configuré).

### Mode production

```bash
# Build
yarn build

# Démarrage
yarn start:prod
```

### Seed de données initiales

Un utilisateur administrateur est automatiquement créé au démarrage de l'application via le `SeedService`.

**Identifiants de connexion** :

- Email : `admin@example.com`
- Password : `admin123`

## Documentation API

Une documentation interactive de l'API est disponible via Swagger :

**URL** : `http://localhost:8080/api/docs`

La documentation inclut :

- Tous les endpoints disponibles
- Les schémas de requête/réponse
- La possibilité de tester les endpoints directement
- L'authentification JWT (Bearer Token)

### Endpoints principaux

#### Authentification

- `POST /auth/login` - Connexion et obtention d'un token JWT

#### Compte bancaire (nécessite authentification)

- `POST /bank-accounts/deposit` - Effectuer un dépôt
- `POST /bank-accounts/withdraw` - Effectuer un retrait
- `GET /bank-accounts/balance` - Consulter le solde
- `GET /bank-accounts/statement` - Obtenir le relevé de compte

## Tests

### Exécuter tous les tests

```bash
yarn test
```

### Tests en mode watch

```bash
yarn test:watch
```

### Tests avec couverture

```bash
yarn test:cov
```

### Tests E2E

```bash
npm run test:e2e
```

## Architecture

Cette application suit les principes de l'**Architecture Hexagonale** (également appelée Ports & Adapters) combinée avec le pattern **CQRS** (Command Query Responsibility Segregation).

### Architecture Hexagonale

L'architecture est organisée en couches concentriques :

```
┌─────────────────────────────────────────┐
│         Interface (Controllers)         │  ← Couche d'entrée
├─────────────────────────────────────────┤
│         Application (Handlers)          │  ← Cas d'usage
├─────────────────────────────────────────┤
│         Domain (Entities, Ports)        │  ← Logique métier pure
├─────────────────────────────────────────┤
│      Infrastructure (Adapters)         │  ← Implémentations techniques
└─────────────────────────────────────────┘
```

#### Couches

1. **Domain** : Cœur de l'application
   - Entités métier (`BankAccount`, `Transaction`, `User`)
   - Ports (interfaces) : `BankAccountRepository`, `UserRepository`
   - Services métier : `Clock`, `StatementPrinter`
   - Exceptions métier : `InsufficientFundsError`, `NegativeAmountError`

2. **Application** : Cas d'usage
   - **Commands** : Opérations qui modifient l'état (dépôt, retrait)
   - **Queries** : Opérations de lecture (solde, relevé)
   - Handlers pour chaque commande/requête

3. **Infrastructure** : Implémentations techniques
   - Adapters : `PrismaBankAccountRepository`, `PrismaUserRepository`
   - Services techniques : `SystemClock`, `ConsoleStatementPrinter`
   - Configuration : `PrismaService`, `AuthService`

4. **Interface** : Points d'entrée
   - Controllers REST
   - DTOs (Data Transfer Objects)

### CQRS (Command Query Responsibility Segregation)

Séparation claire entre :

- **Commands** : Modifient l'état du système
  - `DepositCommand` → `DepositHandler`
  - `WithdrawCommand` → `WithdrawHandler`

- **Queries** : Consultent l'état sans le modifier
  - `GetBalanceQuery` → `GetBalanceHandler`
  - `GetStatementQuery` → `GetStatementHandler`

### Avantages de cette architecture

**Testabilité** : Le domaine est isolé, facilement testable sans dépendances externes  
**Maintenabilité** : Séparation claire des responsabilités  
**Flexibilité** : Facile de changer d'implémentation (ex: remplacer Prisma par MongoDB)  
**Indépendance** : Le domaine ne dépend pas des frameworks ou technologies  
**Évolutivité** : Facile d'ajouter de nouvelles fonctionnalités

## Choix techniques

### Framework : NestJS

**Pourquoi NestJS ?**

- Architecture modulaire basée sur les modules
- Support natif de TypeScript
- Injection de dépendances intégrée
- Décorateurs pour une syntaxe claire
- Support de Swagger intégré
- Écosystème riche (Passport, Prisma, etc.)

### ORM : Prisma

**Pourquoi Prisma ?**

- Type-safety end-to-end
- Migrations automatiques
- Excellent support TypeScript
- Génération de types à partir du schéma
- Performance optimisée
- Outils de développement (Prisma Studio)

### Base de données : PostgreSQL

**Pourquoi PostgreSQL ?**

- Fiabilité et stabilité
- Support des transactions ACID
- Types de données riches (UUID, JSON, etc.)
- Performance excellente
- Open source et mature

### Authentification : JWT (JSON Web Tokens)

**Pourquoi JWT ?**

- Stateless : pas besoin de session serveur
- Scalable : fonctionne bien en architecture distribuée
- Standard : largement adopté
- Intégration facile avec Passport.js

### Architecture : Hexagonale + CQRS

**Pourquoi cette architecture ?**

- Respect des principes SOLID
- Testabilité maximale
- Indépendance vis-à-vis des frameworks
- Séparation claire des responsabilités
- Facilité de maintenance et d'évolution

### Gestion des erreurs

- Exceptions métier personnalisées (`InsufficientFundsError`, `NegativeAmountError`)
- Filtre global d'exceptions (`HttpExceptionFilter`)
- Transformation automatique des exceptions en réponses HTTP appropriées

### Validation

- DTOs avec décorateurs Swagger pour la documentation
- Validation automatique via les DTOs NestJS
- Messages d'erreur clairs et structurés

### CORS

Configuration CORS permissive pour le développement (à restreindre en production selon les besoins).

## Structure du projet

```
src/
├── application/           # Couche Application (CQRS)
│   ├── commands/         # Commandes (modifications)
│   │   ├── handlers/      # Handlers de commandes
│   │   └── implements/   # Implémentations des commandes
│   └── queries/          # Requêtes (lectures)
│       ├── handlers/      # Handlers de requêtes
│       └── implements/   # Implémentations des requêtes
│
├── domain/               # Couche Domaine (cœur métier)
│   ├── entities/         # Entités métier
│   ├── exceptions/       # Exceptions métier
│   ├── ports/            # Interfaces (ports)
│   └── services/         # Services métier
│
├── infrastructure/       # Couche Infrastructure (adapters)
│   ├── adapters/         # Implémentations des ports
│   ├── auth/             # Authentification
│   ├── config/           # Configuration
│   └── filters/          # Filtres HTTP
│
└── interface/            # Couche Interface (entrées)
    ├── controllers/      # Controllers REST
    └── dto/              # Data Transfer Objects

prisma/
├── schema.prisma         # Schéma de base de données
└── migrations/           # Migrations Prisma
```

## Sécurité

- **Authentification JWT** : Tous les endpoints bancaires nécessitent un token JWT valide
- **Hashage des mots de passe** : Utilisation de bcrypt avec salt rounds = 10
- **Validation des entrées** : Validation stricte des montants (positifs uniquement)
- **Gestion des erreurs** : Pas d'exposition d'informations sensibles dans les erreurs

## Améliorations futures

- [ ] Pagination pour les transactions
- [ ] Filtres de recherche pour les transactions
- [ ] Endpoint de profil utilisateur
- [ ] Endpoint de dashboard avec statistiques
- [ ] Rate limiting
- [ ] Logging structuré
- [ ] Monitoring et métriques
- [ ] Tests d'intégration plus complets
- [ ] Documentation OpenAPI plus détaillée

## Auteur

Par [kouameYao](https://github.com/kouameYao/).
