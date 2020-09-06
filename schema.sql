create table users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(16) UNIQUE not null,
    password VARCHAR(100) not null,
    firstName text not null,
    lastName text not null,
    email VARCHAR UNIQUE not null,
    streetaddress VARCHAR not null,
    city VARCHAR not null,
    state VARCHAR not null,
    zipcode VARCHAR not null,
    -- this is where the person's representation info will go
    district text,
    municipality text,
    profilePic VARCHAR,
    points integer,
    firstTimeUser boolean default true,
    race text not null,
    birthdate date not null,
    gender text not null
);

create table causes (
    cause text,
    user_id integer references users (id)
)

create table actions (
    id serial primary key,
    cause varchar not null,
    title varchar(150) not null,
    points integer,
    main_description varchar not null,
    icon varchar,
    mainUrl varchar,
    reading varchar,
    repeatable boolean,
    additionalInfo varchar,
    -- not sure if this one needs to be in reference to this in the events table
    event_id varchar
);

create table action_resources (
    name1 varchar,
    url1 varchar,
    pic1 varchar,
    description1 varchar,
    action_id integer references actions (id)
)

create table policies (
    id serial primary key,
    creator varchar(16) references users (username),
    title varchar(150) not null,
    cause varchar not null,
    description varchar not null,
    dateProposed date not null,
    -- not sure if this one needs to be in reference to this in the events table
    event_id integer references events (id)
);

create table policySupport (
    username varchar(16) references users (username),
    policy_id integer references policies (id),
    whySupport varchar
);

--------------------------------------------------------- Posts

create table posts (
    id SERIAL PRIMARY KEY,
    date_posted TIMESTAMP default now(),
    picurl text not null,
    body VARCHAR not null,
    causes VARCHAR,
    post_url VARCHAR,
    user_id integer references users (id),
    username VARCHAR references users (username),
    event_id integer references events (id),
    points_awarded boolean default false
);

create table likes (
    user_id integer references users (id),
    post_id integer references posts (id)
);

create table comments (
    id serial primary key,
    comment text not null,
    created_at timestamp default now(),
    post_id integer references posts (id),
    user_id integer references users (id),
    username text REFERENCES users (username)
);

-- create table hashtags (
--     id SERIAL PRIMARY KEY,
--     tag VARCHAR
-- );

create table hashtags_posts (
    tag VARCHAR,
    post_id integer references posts (id)
);

-- edit this to fit the new structure
insert into users (username,password,firstName,lastName,email,streetaddress,city,state,zipcode,cause_one,cause_two,cause_three)

values 
    ('dstonem','123456','dylan','stone-miller','dstonemiller@gmail.com', '1234 Marsh Trail Circle', 'Sandy Springs', 'Georgia', '29307','blm','election','climate'),
    ('npatton','123456','nathan','patton','npatton@gmail.com', '1234 Ashford Road', 'Atlanta', 'Georgia', '22236','blm','election','climate'),
    ('fgarcia','123456','frida','garcia','fgar@gmail.com', '1234 Ashford Road', 'Atlanta', 'Georgia', '22236','blm','election','climate')
;

insert into attendees (user_id,event_id)

VALUES
    (1,1),
    (2,1),
    (3,1),
    (1,2),
    (1,3),
    (2,3),
    (3,3)
;

insert into policies (organizer, title, cause, description, dateProposed, event_id)

VALUES
    ('dstonem','Augmented Training for Police Officers','blm','Police officers should be required to receive at least 1000 hours of training from training programs reviewed by a committee of veteran police officers with good records to be approved for large government contracts to continue training.','2020-11-03',1),
    ('dstonem','End Qualified Immunity','blm','Arrest those MFers','2020-11-03',1),
    ('dstonem','End Qualified Immunity','blm','Arrest those MFers','2020-11-03',2)
;

insert into policySupport (username,policy_id,whySupport)

VALUES
    ('dstonem',1,''),
    ('dstonem',2,'Because its important'),
    ('npatton',2,'')
;

insert into posts (date_posted,picurl,body,causes,post_url,user_id,username,event_id) 
values
    ('2004-10-19 10:23:54','/images/icons/blm_icon.png','Receipt from Le Petit Marche in Kirkwood','blm','post1',1,'dstonem',1),
    ('2004-10-20 10:23:54','/images/icons/blm_icon.png','Built an app prototype to collect data on how best to support sustained activism','blm','post2',1,'dstonem',2),
    ('2004-10-21 10:23:54','/images/icons/environment_icon.png','Grew my own pumpkin for Halloween this year!','climate','post3',1,'dstonem',1),
    
    ('2004-10-22 10:23:54','/images/icons/environment_icon.png','Built this building using sustainable materials','climate','post4',2,'npatton',2),
    ('2004-10-23 10:23:54','/images/icons/blm_icon.png','I love Le Petit Marche!','blm','post5',2,'npatton',1),
    ('2004-10-24 10:23:54','/images/icons/environment_icon.png','Started cooking with my own biofuel made from compost tea! Come enjoy a yard-to-table meal cooked with sustainable fuel!','climate','post6',2,'npatton',3),
    
    ('2004-10-25 10:23:54','/images/icons/election_icon.png','I voted early!','election','post7',3,'fgarcia',1),
    ('2004-10-26 10:23:54','/images/icons/environment_icon.png','I just bought these sustainable silicone baggies and I found out you can COOK things in them!','climate','post8',3,'fgarcia',3),
    ('2004-10-27 10:23:54','/images/icons/blm_icon.png','Just signed up for this professional development course! Supporting a black entrepreneur!','blm','post9',3,'fgarcia',3)
;

insert into likes (user_id, post_id)
values
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 5),
    (2, 6);

insert into comments (comment,post_id,user_id,username)
VALUES
    ('Nice! Love that place',1,2,'npatton'),
    ('Nice one!',4,1,'dstonem');

--how do we join this actions table with the event_id table? or do we even need to?
insert into actions (cause,title,points,main_description,name1,url1,pic1,description1,name2,url2,pic2,description2,name3,url3,pic3,description3,name4,url4,pic4,description4,name5,url5,pic5,description5,icon,mainUrl,reading,repeatable,additionalInfo)
VALUES
    ('blm',
    'Support a Black-Owned Business',
    50,
    'Hungry? Need some retail therapy? Looking for something artisan? Support black-owned!',
    'Check out our resources to get you started!',
    '',
    '',
    '',
    'Find a Business Near You',
    -- how do I make this link dynamic based on the user's zipcode/city-state?
    'https://www.yelp.com/search?find_desc=Black+Owned+Businesses&find_loc=${city}%2C+${state}&ns=1',
    '/images/map.png',
    'Click the image to find black-owned businesses in your area!',
    'Apartment Therapy',
    'https://www.apartmenttherapy.com/shop-black-owned-businesses-36759922',
    '/images/apartment_therapy.jpg',
    'Accessorize your apartment in style with these black-owned businesses.',
    'Etsy',
    'https://www.etsy.com/featured/blackownedshops?utm_source=google&utm_medium=cpc&utm_term=black%20owned%20businesses_e&utm_campaign=Search_US_Nonbrand_GGL_Politics_Social-Justice_New_LT_Exact&utm_ag=Black-Owned%2BShops&utm_custom1=_k_CjwKCAjw4rf6BRAvEiwAn2Q76mS6nTnAPKlrpGPLc5l2kOVGQPkLPVmQycgadigvXAR6jWHJkvvAuhoCf7gQAvD_BwE_k_&utm_content=go_10221881501_102356872975_439825159817_aud-301856855998:kwd-312223407776_c_&utm_custom2=10221881501&gclid=CjwKCAjw4rf6BRAvEiwAn2Q76mS6nTnAPKlrpGPLc5l2kOVGQPkLPVmQycgadigvXAR6jWHJkvvAuhoCf7gQAvD_BwE',
    '/images/etsy.jpg',
    'Shop black artisans on Etsy.',
    'Black Owned Business Network',
    'https://www.blackownedbiz.com/directory/',
    '/images/blackbizowner.png',
    'Looking for more professional services? Explore one of the largest directories of black-owned businesses.',
    '/images/icons/blm_icon.png',
    'http://yelp.com',
    'https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',
    true,
    ''),

    ('blm','Support a Black Artist',50,'Buy some art!','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Support Organizations Supporting Black Life',50,'','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Share Black Organizations on Social Media',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Volunteer',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Support an Environmental Campaign',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Red-Meat-Free Week',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Purchase a Reusable Item',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Ride a Bike Instead of Drive (Three Times)',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Carpool',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Full Recycling Bin!',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Ride Public Transit Five Times',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Vote Early',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Vote By Mail',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Attend a City/County Council Meeting',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Support a Political Organization',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Join a Political Organization',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Sign a Petition',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Learn About Local Politics',5,'dstonem','name1','url1','pic1','description1','name2','url2','pic2','description2','name3','url3','pic3','description3','name4','url4','pic4','description4','name5','url5','pic5','description5','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,'');
