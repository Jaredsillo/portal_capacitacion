-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: portal_capacitacion
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo_evento` enum('login','ver_manual','marcar_leido','click_sistema','descargar_manual','admin','quiz') NOT NULL,
  `objeto_id` int(11) DEFAULT NULL,
  `detalle` varchar(400) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_act_user` (`usuario_id`),
  KEY `idx_act_fecha` (`fecha_hora`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES (1,1,'login',NULL,'Inició sesión con Google',NULL,'2026-08-29 11:48:13'),(2,1,'admin',NULL,'Dio de alta a systems_developer',NULL,'2026-08-29 11:55:28'),(3,2,'login',NULL,'Inició sesión con Google',NULL,'2026-08-29 11:55:36'),(4,1,'admin',2,'Editó el sistema CURSO DE INDUCCIÓN A NUEVO PERSONAL',NULL,'2026-08-29 12:11:48'),(5,1,'admin',2,'Subió la presentación \"CURSO DE INDUCCIÓN A NUEVO PERSONAL\"',NULL,'2026-08-29 12:38:37'),(6,1,'admin',2,'Editó las palabras clave de \"CURSO DE INDUCCIÓN A NUEVO PERSONAL\" (3 palabras)',NULL,'2026-08-29 12:39:08'),(7,1,'admin',1,'Editó las palabras clave de \"Manual de funcionamiento del Sistema de Administración Escolar (SAE)\" (3 palabras)',NULL,'2026-08-29 12:39:47'),(8,1,'ver_manual',2,'Abrió el manual de CURSO DE INDUCCIÓN A NUEVO PERSONAL',NULL,'2026-08-29 12:39:56'),(9,1,'login',NULL,'Inició sesión con Google',NULL,'2026-08-29 13:05:38'),(10,1,'login',NULL,'Inició sesión con Google',NULL,'2026-08-31 08:55:06'),(11,1,'ver_manual',2,'Abrió el manual de CURSO DE INDUCCIÓN A NUEVO PERSONAL',NULL,'2026-08-31 08:55:18'),(12,1,'admin',3,'Editó el sistema CURSO DE INDUCCIÓN A DOCENTES.pptx',NULL,'2026-08-31 09:18:03'),(13,1,'admin',3,'Editó el sistema CURSO DE INDUCCIÓN A DOCENTES',NULL,'2026-08-31 09:18:20'),(14,1,'admin',3,'Subió la presentación \"CURSO DE INDUCCIÓN A DOCENTES\"',NULL,'2026-08-31 09:19:10'),(15,1,'admin',3,'Editó las palabras clave de \"CURSO DE INDUCCIÓN A DOCENTES\" (3 palabras)',NULL,'2026-08-31 09:19:32'),(16,1,'admin',4,'Creó el sistema SIADUH',NULL,'2026-08-31 09:28:19'),(17,1,'admin',NULL,'Dio de alta a José Marcos Lucena Romero',NULL,'2026-08-31 09:44:52'),(18,1,'admin',2,'Editó los datos de systems_developer',NULL,'2026-08-31 09:45:08'),(19,1,'admin',4,'Se le asignó el sistema SIADUH',NULL,'2026-08-31 09:49:25'),(20,1,'login',NULL,'Inició sesión con Google',NULL,'2026-08-31 09:57:40'),(21,1,'admin',2,'Editó los datos de systems_developer',NULL,'2026-08-31 10:05:22'),(22,2,'login',NULL,'Inició sesión con Google',NULL,'2026-08-31 10:05:32'),(23,1,'admin',5,'Creó el sistema Correo institucional',NULL,'2026-08-31 10:15:20'),(24,2,'login',NULL,'Inició sesión con Google',NULL,'2026-08-31 10:19:48'),(25,1,'login',NULL,'Inició sesión con Google',NULL,'2026-08-31 10:20:02'),(26,2,'admin',4,'Se le asignó el sistema SIADUH',NULL,'2026-08-31 10:20:20'),(27,2,'admin',2,'Se le asignó el sistema CURSO DE INDUCCIÓN A NUEVO PERSONAL',NULL,'2026-08-31 10:20:23'),(28,1,'ver_manual',1,'Abrió el manual de Mi Escuela (SAE)',NULL,'2026-08-31 10:30:58');
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `sistema_id` int(11) NOT NULL,
  `obligatorio` tinyint(1) NOT NULL DEFAULT 1,
  `asignado_por` int(11) DEFAULT NULL,
  `fecha_asignacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asig` (`usuario_id`,`sistema_id`),
  KEY `sistema_id` (`sistema_id`),
  CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`sistema_id`) REFERENCES `sistemas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
INSERT INTO `asignaciones` VALUES (1,1,1,1,1,'2026-08-29 11:46:45'),(2,1,2,1,1,'2026-08-29 11:46:45'),(3,1,3,1,1,'2026-08-29 11:46:45'),(4,1,4,1,1,'2026-08-31 09:49:25'),(5,2,4,1,1,'2026-08-31 10:20:20'),(6,2,2,1,1,'2026-08-31 10:20:23');
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intentos_quiz`
--

DROP TABLE IF EXISTS `intentos_quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intentos_quiz` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `aprobado` tinyint(1) NOT NULL DEFAULT 0,
  `respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`respuestas`)),
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_intento_user` (`usuario_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `intentos_quiz_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `intentos_quiz_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intentos_quiz`
--

LOCK TABLES `intentos_quiz` WRITE;
/*!40000 ALTER TABLE `intentos_quiz` DISABLE KEYS */;
/*!40000 ALTER TABLE `intentos_quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manuales`
--

DROP TABLE IF EXISTS `manuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manuales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sistema_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `codigo` varchar(80) DEFAULT NULL,
  `archivo_path` varchar(300) NOT NULL,
  `total_paginas` int(11) NOT NULL DEFAULT 1,
  `version` varchar(20) NOT NULL DEFAULT 'V00',
  `requiere_confirmacion` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sistema_id` (`sistema_id`),
  CONSTRAINT `manuales_ibfk_1` FOREIGN KEY (`sistema_id`) REFERENCES `sistemas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manuales`
--

LOCK TABLES `manuales` WRITE;
/*!40000 ALTER TABLE `manuales` DISABLE KEYS */;
INSERT INTO `manuales` VALUES (1,1,'Manual de funcionamiento del Sistema de Administración Escolar (SAE)','SGCUH-CSRDT-M-001','SGCUH-CSRDT-M-001.pdf',54,'V00',0,'2026-08-29 11:46:45'),(2,2,'CURSO DE INDUCCIÓN A NUEVO PERSONAL','CINP','CINP_1788028717092.pptx',1,'V00',0,'2026-08-29 12:38:37'),(3,3,'CURSO DE INDUCCIÓN A DOCENTES','CIDOC','CIDOC_1788189550738.pptx',1,'V00',0,'2026-08-31 09:19:10');
/*!40000 ALTER TABLE `manuales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `palabras_clave`
--

DROP TABLE IF EXISTS `palabras_clave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `palabras_clave` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `manual_id` int(11) NOT NULL,
  `palabra` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `manual_id` (`manual_id`),
  CONSTRAINT `palabras_clave_ibfk_1` FOREIGN KEY (`manual_id`) REFERENCES `manuales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `palabras_clave`
--

LOCK TABLES `palabras_clave` WRITE;
/*!40000 ALTER TABLE `palabras_clave` DISABLE KEYS */;
INSERT INTO `palabras_clave` VALUES (1,2,'UNIVERSIDAD'),(2,2,'SIADUH'),(3,2,'POAS'),(4,1,'HIPOCRATES'),(5,1,'MIESC'),(6,1,'ESCOLAR'),(7,3,'DOCENTE'),(8,3,'DTC'),(9,3,'ESTUDIANTE');
/*!40000 ALTER TABLE `palabras_clave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preguntas`
--

DROP TABLE IF EXISTS `preguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preguntas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `texto` varchar(500) NOT NULL,
  `tipo` enum('opcion','vf') NOT NULL DEFAULT 'opcion',
  `opciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`opciones`)),
  `respuesta_correcta` int(11) NOT NULL,
  `explicacion` varchar(500) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preguntas`
--

LOCK TABLES `preguntas` WRITE;
/*!40000 ALTER TABLE `preguntas` DISABLE KEYS */;
/*!40000 ALTER TABLE `preguntas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progreso_usuario`
--

DROP TABLE IF EXISTS `progreso_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progreso_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `manual_id` int(11) NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `paginas_vistas` int(11) NOT NULL DEFAULT 0,
  `tiempo_segundos` int(11) NOT NULL DEFAULT 0,
  `version_leida` varchar(20) DEFAULT NULL,
  `fecha_leido` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prog` (`usuario_id`,`manual_id`),
  KEY `manual_id` (`manual_id`),
  CONSTRAINT `progreso_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `progreso_usuario_ibfk_2` FOREIGN KEY (`manual_id`) REFERENCES `manuales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progreso_usuario`
--

LOCK TABLES `progreso_usuario` WRITE;
/*!40000 ALTER TABLE `progreso_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `progreso_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `manual_id` int(11) NOT NULL,
  `modelo` varchar(60) DEFAULT NULL,
  `min_aprobar` int(11) NOT NULL DEFAULT 60,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `generado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `manual_id` (`manual_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`manual_id`) REFERENCES `manuales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,2,NULL,60,1,'2026-08-29 12:39:08'),(2,1,NULL,60,1,'2026-08-29 12:39:47'),(3,3,NULL,60,1,'2026-08-31 09:19:32');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sistemas`
--

DROP TABLE IF EXISTS `sistemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sistemas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(160) NOT NULL,
  `descripcion` varchar(400) DEFAULT NULL,
  `url_destino` varchar(400) DEFAULT NULL,
  `icono` varchar(40) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sistemas`
--

LOCK TABLES `sistemas` WRITE;
/*!40000 ALTER TABLE `sistemas` DISABLE KEYS */;
INSERT INTO `sistemas` VALUES (1,'Mi Escuela (SAE)','App web de administración escolar: inscripciones, calificaciones y expedientes.','https://www.mi-escuelamx.com/UHIPOCRATES/',NULL,1,1,'2026-08-29 11:46:45'),(2,'CURSO DE INDUCCIÓN A NUEVO PERSONAL','PENDIENTE',NULL,NULL,2,1,'2026-08-29 11:46:45'),(3,'CURSO DE INDUCCIÓN A DOCENTES','PENDIENTE',NULL,NULL,3,1,'2026-08-29 11:46:45'),(4,'SIADUH','Sistema de información y administración de la universidad.','http://10.10.1.8/siaduh/mod/login/',NULL,0,1,'2026-08-31 09:28:19'),(5,'Correo institucional','Google Workspace: correo, calendario y Drive.','https://mail.google.com/',NULL,0,1,'2026-08-31 10:15:20');
/*!40000 ALTER TABLE `sistemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(160) NOT NULL,
  `correo` varchar(160) NOT NULL,
  `puesto` varchar(160) DEFAULT NULL,
  `area` varchar(160) DEFAULT NULL,
  `num_reloj_checador` varchar(40) DEFAULT NULL,
  `rol` enum('usuario','admin','th') NOT NULL DEFAULT 'usuario',
  `estado` enum('alta','baja') NOT NULL DEFAULT 'alta',
  `fecha_alta` date DEFAULT NULL,
  `fecha_baja` date DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Angel Jared Vazquez Roman','desarrollo.sistemas@uhipocrates.edu.mx','Desarrollador de Software','Coord. de Sistemas, Redes y Desarrollo Tecnológico',NULL,'admin','alta','2026-08-29',NULL,'2026-08-31 10:20:02','2026-08-29 11:46:45'),(2,'systems_developer','systems_developer@uhipocrates.edu.mx','TH','Talento Humano','123','usuario','alta','2026-08-29',NULL,'2026-08-31 10:19:48','2026-08-29 11:55:28'),(3,'José Marcos Lucena Romero','coordinacion.sistemas@uhipocrates.edu.mx','Coordinador de Sistemas, Redes y Desarrollo Tecnológico','Coord. de Sistemas, Redes y Desarrollo Tecnológico','','admin','alta','2026-08-31',NULL,NULL,'2026-08-31 09:44:52');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'portal_capacitacion'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-31 11:47:12
