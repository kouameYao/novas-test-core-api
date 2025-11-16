# BankAccount System - Test Technique Fintech

Implémentation d'un système bancaire respectant strictement l'interface imposée, avec une architecture professionnelle basée sur **Domain-Driven Design (DDD)**, **CQRS** et **Architecture Hexagonale**.

## 📋 Interface Imposée (Strictement Respectée)

L'interface demandée est **strictement respectée** dans la classe `BankAccount` :

```typescript
export class BankAccount {
  deposit(amount: number): void; // ✅ Conforme - Aucune modification
  withdraw(amount: number): void; // ✅ Conforme - Aucune modification
  printStatement(): void; // ✅ Conforme - Aucune modification
}
```

**✅ Aucune modification de signature** - L'interface est respectée à 100%.

**Fonctionnalités :**

- ✅ `deposit(int amount)` : Refuse montants nuls ou négatifs
- ✅ `withdraw(int amount)` : Refuse montants nuls/négatifs et découvert
- ✅ `printStatement()` : Affiche relevé trié par date décroissante avec solde cumulatif

## 🚀 Utilisation Simple (Interface de Base)

### Exemple Minimal

```typescript
import { BankAccount } from './src/domain/model/BankAccount';

// Créer un compte (sans infrastructure)
const account = new BankAccount('account-1');

// Utiliser l'interface conforme
account.deposit(1000); // ✅ deposit(amount: number): void
account.deposit(2000); // ✅ Date gérée en interne (Date.now())
account.withdraw(500); // ✅ withdraw(amount: number): void

// Afficher le relevé
account.printStatement(); // ✅ printStatement(): void

// Output:
// Date || Montant || Solde
// 2024-01-10 || -500 || 2500
// 2024-01-10 || 2000 || 3000
// 2024-01-10 || 1000 || 1000
```

### Exemple avec Contrôle des Dates (Pour Tests)

```typescript
import { BankAccount } from './src/domain/model/BankAccount';
import { FakeClock } from './src/infrastructure/adapters/FakeClock';

// Créer un compte avec un Clock pour contrôler les dates (optionnel)
const clock = new FakeClock(new Date('2024-01-10'));
const account = new BankAccount('account-1', clock);

account.deposit(1000);
clock.setDate(new Date('2024-01-13'));
account.deposit(2000);
clock.setDate(new Date('2024-01-14'));
account.withdraw(500);

account.printStatement();
// Output:
// Date || Montant || Solde
// 2024-01-14 || -500 || 2500
// 2024-01-13 || 2000 || 3000
// 2024-01-10 || 1000 || 1000
```

---

## 🎁 Bonus Full-Stack (Optionnel)

Ce projet va **au-delà des exigences de base** en proposant des fonctionnalités bonus qui démontrent une maîtrise full-stack :

- ✅ **API REST** : Endpoints `/deposit`, `/withdraw`, `/statement`, `/balance`
- ✅ **Swagger/OpenAPI** : Documentation interactive de l'API
- ✅ **Authentification JWT** : Système d'authentification complet
- ✅ **Persistance PostgreSQL** : Base de données relationnelle avec TypeORM
- ✅ **Architecture Avancée** : Hexagonale + CQRS + DDD
- ✅ **Tests Complets** : 12 fichiers de tests avec couverture complète

**Note importante :** Ces bonus sont **optionnels** et démontrent une maîtrise full-stack. L'interface de base est respectée dans `BankAccount` et peut être utilisée **sans aucune infrastructure**.

## 📐 Architecture

### Structure du Projet

```
/src
  /domain                    # Couche Domain (Cœur métier)
    /model
      BankAccount.ts         # Aggregate Root
      Transaction.ts         # Value Object
      TransactionType.ts    # Enum
    /services
      Clock.ts              # Port (interface)
      StatementPrinter.ts   # Port (interface)
    /errors
      NegativeAmountError.ts
      InsufficientFundsError.ts

  /application               # Couche Application (CQRS)
    /commands
      /implements
        DepositCommand.ts
        WithdrawCommand.ts
      /handlers
        DepositHandler.ts
        WithdrawHandler.ts
    /queries
      /implements
        GetBalanceQuery.ts
        GetStatementQuery.ts
      /handlers
        GetBalanceHandler.ts
        GetStatementHandler.ts
    /dto
      StatementLine.ts

  /ports                     # Ports Hexagonaux
    BankAccountRepository.ts

  /infrastructure            # Couche Infrastructure
    /adapters
      InMemoryBankAccountRepository.ts
      ConsoleStatementPrinter.ts
      SystemClock.ts
      FakeClock.ts           # Pour les tests
    /controllers
      BankAccountController.ts  # Implémente l'interface imposée
    index.ts                 # Wiring NestJS

/tests
  domain/*.spec.ts
  application/commands/*.spec.ts
  application/queries/*.spec.ts
  infrastructure/*.spec.ts
```

## 🏗️ Principes Architecturaux

### 1. Architecture Hexagonale (Ports & Adapters)

L'architecture hexagonale isole le domaine métier de l'infrastructure technique.

**Ports (Interfaces) :**

- `BankAccountRepository` : Abstraction pour la persistance
- `Clock` : Abstraction pour le temps (permettant de mocker les dates)
- `StatementPrinter` : Abstraction pour l'affichage

**Adapters (Implémentations) :**

- `TypeOrmBankAccountRepository` : Persistance PostgreSQL via TypeORM
- `TypeOrmUserRepository` : Persistance PostgreSQL via TypeORM
- `SystemClock` : Horloge système réelle
- `ConsoleStatementPrinter` : Affichage console
- `FakeClock` : Horloge mockable pour les tests

**Avantages :**

- Le domaine est indépendant de l'infrastructure
- Facile de changer de base de données, d'UI, etc.
- Tests isolés avec des mocks

### 2. Domain-Driven Design (DDD)

**Aggregate Root : `BankAccount`**

- Encapsule toutes les règles métier
- Gère l'état interne (transactions)
- Aucune dépendance vers l'infrastructure
- Transactions immuables

**Règles Métier :**

- ✅ `amount > 0` pour toutes les transactions
- ✅ Pas de découvert autorisé
- ✅ Solde calculé à partir des transactions
- ✅ Transactions immuables

**Value Objects :**

- `Transaction` : Immutable, contient type, montant, date
- `TransactionType` : Enum (DEPOSIT, WITHDRAWAL)

**Domain Errors :**

- `NegativeAmountError` : Montant négatif ou zéro
- `InsufficientFundsError` : Solde insuffisant

### 3. CQRS (Command Query Responsibility Segregation)

Séparation stricte entre les opérations d'écriture (Commands) et de lecture (Queries).

**Commands (Écriture) :**

- `DepositCommand` → `DepositHandler`
- `WithdrawCommand` → `WithdrawHandler`

**Queries (Lecture) :**

- `GetBalanceQuery` → `GetBalanceHandler`
- `GetStatementQuery` → `GetStatementHandler`

**Avantages :**

- Séparation claire des responsabilités
- Optimisation indépendante (cache pour queries, validation pour commands)
- Scalabilité (lecture/écriture séparées)

## 🔄 Flux d'Exécution

### Dépôt (Deposit)

```
BankAccountController.deposit(amount)
  ↓
DepositCommand(accountId, amount)
  ↓
DepositHandler.execute(command)
  ↓
Repository.findById() → BankAccount (ou création)
  ↓
BankAccount.deposit(amount, clock.now())
  ↓
Repository.save(account)
```

### Retrait (Withdraw)

```
BankAccountController.withdraw(amount)
  ↓
WithdrawCommand(accountId, amount)
  ↓
WithdrawHandler.execute(command)
  ↓
Repository.findById() → BankAccount
  ↓
BankAccount.withdraw(amount, clock.now())
  ↓ (vérifie solde suffisant)
Repository.save(account)
```

### Affichage du Relevé (Print Statement)

```
BankAccountController.printStatement()
  ↓
GetStatementQuery(accountId)
  ↓
GetStatementHandler.execute(query)
  ↓
Repository.findById() → BankAccount
  ↓
Calcul des StatementLine (tri DESC par date)
  ↓
StatementPrinter.print(lines)
```

## 🧪 Tests

### Tests du Domain

- ✅ Transactions immuables
- ✅ Règles métier (montant positif, pas de découvert)
- ✅ Calcul du solde correct

### Tests des Commands

- ✅ Dépôt positif → OK
- ✅ Retrait solde insuffisant → erreur
- ✅ Validation des montants

### Tests des Queries

- ✅ Solde correct
- ✅ Statement trié DESC par date
- ✅ Calcul du running balance

### Tests de l'Infrastructure

- ✅ Repository mocké
- ✅ Printer mocké (pas de console.log dans tests)
- ✅ Clock mockée (FakeClock)

## 🚀 Utilisation

### Installation

```bash
yarn install
```

### Tests

```bash
# Tests unitaires
yarn test

# Tests avec couverture
yarn test:cov

# Tests en mode watch
yarn test:watch
```

---

## 🎁 Configuration Bonus (Full-Stack)

Les sections suivantes concernent les **bonus optionnels** (API REST, base de données, etc.). L'interface de base fonctionne **sans ces éléments**.

### Configuration de la Base de Données PostgreSQL (Bonus)

L'application peut utiliser PostgreSQL avec TypeORM pour la persistance (bonus full-stack).

#### 1. Installer PostgreSQL

Assurez-vous que PostgreSQL est installé et en cours d'exécution sur votre machine.

#### 2. Créer la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE core_api;

# Quitter
\q
```

#### 3. Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=core_api

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Environment
NODE_ENV=development
```

**Note :** En développement, TypeORM créera automatiquement les tables (`synchronize: true`). En production, utilisez des migrations.

#### 4. Structure de la Base de Données

Les tables suivantes sont créées automatiquement :

- **users** : Utilisateurs du système
- **bank_accounts** : Comptes bancaires
- **transactions** : Transactions (dépôts et retraits)

### Exécution de l'API REST (Bonus)

```bash
# Développement
yarn start:dev

# Production
yarn start:prod
```

L'API sera disponible sur `http://localhost:3000` avec la documentation Swagger sur `http://localhost:3000/api/docs`.

### Utilisation de l'API REST (Bonus)

```bash
# Dépôt
curl -X POST http://localhost:3000/bank-account/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 1000}'

# Retrait
curl -X POST http://localhost:3000/bank-account/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 500}'

# Relevé
curl -X GET http://localhost:3000/bank-account/statement \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solde
curl -X GET http://localhost:3000/bank-account/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Choix Architecturaux

### Pourquoi CQRS ?

- Séparation claire lecture/écriture
- Optimisation indépendante
- Facilite l'ajout de fonctionnalités (audit, cache, etc.)

### Pourquoi Architecture Hexagonale ?

- Isolation du domaine
- Testabilité maximale
- Flexibilité pour changer d'infrastructure

### Pourquoi DDD ?

- Modélisation métier claire
- Règles métier centralisées
- Code expressif et maintenable

### Pourquoi NestJS ?

- Injection de dépendances native
- Structure modulaire
- Support TypeScript complet
- Facilite l'implémentation des patterns

## 📝 Notes Techniques

- **Transactions immuables** : Chaque transaction est un objet immuable
- **Aggregate Root** : `BankAccount` est l'unique point d'entrée pour modifier l'état
- **Ports & Adapters** : Toutes les dépendances externes sont abstraites
- **Tests isolés** : Chaque couche testée indépendamment avec mocks
- **Type Safety** : TypeScript strict pour éviter les erreurs à l'exécution

## 🔮 Évolutions Possibles

- Event Sourcing pour l'historique complet
- Projections CQRS pour optimiser les queries
- Front-end React/Vue/Angular
- Application mobile (React Native, Flutter)
- CI/CD avec GitHub Actions
- Monitoring et logging avancés

## 📚 Références

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [CQRS Pattern - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)
