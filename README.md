# DynaDocument

If you generate PDF documents in batches using templates and only modifying the data, you probably face one of these problems: 1) you hard-code the template directly into the code, or 2) you edit each one manually in a traditional text editor.

This is DynaDocument: an open-source project for generating PDF documents using templates and dynamic tags. Admin profiles create the base structure, and third-party systems integrate via API.

## Prerequisites

Before running the project, make sure you have:

- **Docker** >= 24.x  
- **Docker Compose** >= 2.x  


## Development Flow

**1. Start all services**:
   ```bash
   docker compose up -d
   ```
**2. Copy environment variables**:

In the root of the project, copy `.env.example` in each service, to a new file `.env`

## Services and Ports

### 🧩 APIs (Laravel Microservices)
- **User Service**
  - Container: `user-nginx`
  - URL: http://localhost:8081
  - Description: Laravel User API

- **Template Service**
  - Container: `template-nginx`
  - URL: http://localhost:8082
  - Description: Laravel Template API

- **File Service**
  - Container: `file-nginx`
  - URL: http://localhost:8083
  - Description: Laravel File API

### 💻 Frontend
- **Frontend**
  - Container: `frontend`
  - URL: http://localhost:5173
  - Description: React.js application

### 🗄️ Database
- **MySQL**
  - Container: `mysql-db`
  - Host: localhost:3306
  - Description: Database (user: root / pass: root)
  - Soon I'll change it to PostgreSql. For now, it's a MySQL.

### 📡 Messaging (Kafka + Zookeeper)
- **Kafka Broker 1**
  - Container: `kafka1`
  - Host: localhost:9092
  - Description: Kafka broker #1

- **Kafka Broker 2**
  - Container: `kafka2`
  - Host: localhost:9093
  - Description: Kafka broker #2

- **Kafka Broker 3**
  - Container: `kafka3`
  - Host: localhost:9094
  - Description: Kafka broker #3

- **Zookeeper**
  - Container: `zookeeper`
  - Host: localhost:2181
  - Description: Kafka coordination service

### 🚪 API Gateway (Kong)
- **Kong Proxy (HTTP)**
  - Container: `kong`
  - URL: http://localhost:8000
  - Description: Public API Gateway

- **Kong Proxy (HTTPS)**
  - Container: `kong`
  - URL: https://localhost:8443
  - Description: Public API Gateway (secure)

- **Kong Admin API (HTTP)**
  - Container: `kong`
  - URL: http://localhost:8001
  - Description: Kong administrative API

- **Kong Admin API (HTTPS)**
  - Container: `kong`
  - URL: https://localhost:8444
  - Description: Kong administrative API (secure)

### 🛠️ Dev Tools
- **Localstack**
  - Container: `localstack`
  - URL: http://localhost:4566
  - Description: AWS emulator (S3 enabled)

## Resume of ports

For all microsservices access, you must call the API by Kong API Gateway centralize, in http://localhost:8000. Example: http://localhost:8000/api/auth/login. That's the same of http://localhost:8081/api/auth/login

## Basic access

- You may create a new user accessing the User Container, running Tinker:

```
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

DB::table('user_service.users')->insert([
    'id' => 'a3c5f3d8-91d1-4adf-9b2a-0c0a0ee3943a',
    'name' => 'Usuário Exemplo',
    'email' => 'admin@example.com',
    'password' => '$2y$12$iKPRyWg9jW2yx3AhhSvy4u1MTXahKLg.UrrNT15JJ97IFAq5lC4G6', /*Will depend on your APP_KEY. You can create with Hash::make('password');*/
    'company_id' => '9d4e13c2-4b1a-4b02-9c38-90f487013f00',
    'email_verified_at' => Carbon::now(),
    'photo_url' => null,
    'remember_token' => null,
    'created_at' => Carbon::now(),
    'updated_at' => Carbon::now(),
]);
```

## Important Detail:

For now, you'll need execute the Consumers manually. Until now, there's two commands essentials for this flow:

File-service: ```php artisan kafka:consume-template-delivered```

Template-service: ``` php artisan kafka:consume-template-requested```
