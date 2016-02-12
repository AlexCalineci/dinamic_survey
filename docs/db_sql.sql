/*schema*/
DROP SCHEMA IF EXISTS surveys ;
CREATE SCHEMA IF NOT EXISTS surveys DEFAULT CHARACTER SET latin1 ;
USE surveys ;


/*db tables*/
drop table if exists Users;

CREATE TABLE Users (
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id)
);

drop table if exists surveys;

CREATE TABLE surveys (
  id int NOT NULL AUTO_INCREMENT,
  user_id INT,
  survey_name VARCHAR(150) NOT NULL,
  survey_json text,
  created_at date,
  updated_at date,
  PRIMARY KEY (id),
  foreign key (user_id) references users(user_id) 
);

drop table if exists survey_details;

CREATE TABLE survey_details (
  id int NOT NULL AUTO_INCREMENT,
  survey_id int NOT NULL,
  user_id INT,
  ans_no int,
  parentId VARCHAR(150),
  parentText varchar(4000),
  parentckval varchar(4000),
  parentck varchar(1),
  childId VARCHAR(150),
  childText varchar(4000),
  childckval varchar(4000),
  childck varchar(1),
  relation_detail varchar(4000),
  PRIMARY KEY (id),
  foreign key (user_id) references users(user_id),
  foreign key (survey_id) references surveys(id)
);

/*log all of existing records regarding the survey*/
drop table if exists survey_qa_det;

create table survey_qa_det(
  survey_id numeric,
  user_id numeric,
  survey_name varchar(500),
  uniqueId numeric,
  blockId varchar(100),
  questionText varchar(500),
  answerNr numeric,
  answertext varchar(500),
  lastSelected varchar(1)
);

/*insert user for test*/
insert into users values(null,'admin','test');