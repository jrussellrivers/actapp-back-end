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
    nextElectionDate date,
    pollingPlace varchar,
    profilePic VARCHAR,
    points integer,
    firstTimeUser boolean default true,
    race text not null,
    gender text not null,
    birthdate date not null
);

create table causes (
    cause text,
    user_id integer references users (id)
);

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
    additionalInfo varchar
);

create table action_resources (
    name varchar,
    url varchar,
    pic varchar,
    description varchar,
    action_id integer references actions (id)
);

create table policies (
    id serial primary key,
    creator varchar(16) references users (username),
    title varchar(150) not null,
    cause varchar not null,
    description varchar not null,
    dateProposed date not null
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
insert into users (username,password,firstName,lastName,email,streetaddress,city,state,zipcode,nextElectionDate,pollingPlace,profilePic,points,firstTimeUser,race,gender,birthdate)

values 
    ('dstonem','123456','dylan','stone-miller','dstonemiller@gmail.com', '1234 Marsh Trail Circle', 'Sandy Springs', 'Georgia', '29307','11-3-2020','123 Fake Street','headshot_manbun.png','100','true','white','m','09/28/1990'),
    ('npatton','123456','nathan','patton','npatton@gmail.com', '1234 Ashford Road', 'Atlanta', 'Georgia', '22236','11-3-2020','123 Fake Street','headshot_manbun.png','100','true','white','m','09/28/1990'),
    ('fgarcia','123456','frida','garcia','fgar@gmail.com', '1234 Ashford Road', 'Atlanta', 'Georgia', '22236','11-3-2020','123 Fake Street','headshot_manbun.png','100','true','white','m','09/28/1990')
;

insert into causes (cause,user_id) 
VALUES
    ('blm',1),
    ('blm',2),
    ('blm',3),
    ('climate',1),
    ('climate',2),
    ('usps',1);

insert into policies (title, cause, description, dateProposed)

VALUES
    ('Augmented Training for Police Officers','blm','Police officers should be required to receive at least 1000 hours of training from training programs reviewed by a committee of veteran police officers with good records to be approved for large government contracts to continue training.','2020-11-03'),
    ('End Qualified Immunity','blm','Arrest those MFers','2020-11-03'),
    ('End Qualified Immunity','blm','Arrest those MFers','2020-11-03')
;

insert into policySupport (username,policy_id,whySupport)

VALUES
    ('dstonem',1,''),
    ('dstonem',2,'Because its important'),
    ('npatton',2,'')
;

insert into posts (date_posted,picurl,body,causes,post_url,user_id,username) 
values
    ('2004-10-19 10:23:54','/images/icons/blm_icon.png','Receipt from Le Petit Marche in Kirkwood','blm','post1',1,'dstonem'),
    ('2004-10-20 10:23:54','/images/icons/blm_icon.png','Built an app prototype to collect data on how best to support sustained activism','blm','post2',1,'dstonem'),
    ('2004-10-21 10:23:54','/images/icons/environment_icon.png','Grew my own pumpkin for Halloween this year!','climate','post3',1,'dstonem'),
    
    ('2004-10-22 10:23:54','/images/icons/environment_icon.png','Built this building using sustainable materials','climate','post4',2,'npatton'),
    ('2004-10-23 10:23:54','/images/icons/blm_icon.png','I love Le Petit Marche!','blm','post5',2,'npatton'),
    ('2004-10-24 10:23:54','/images/icons/environment_icon.png','Started cooking with my own biofuel made from compost tea! Come enjoy a yard-to-table meal cooked with sustainable fuel!','climate','post6',2,'npatton'),
    
    ('2004-10-25 10:23:54','/images/icons/election_icon.png','I voted early!','election','post7',3,'fgarcia'),
    ('2004-10-26 10:23:54','/images/icons/environment_icon.png','I just bought these sustainable silicone baggies and I found out you can COOK things in them!','climate','post8',3,'fgarcia'),
    ('2004-10-27 10:23:54','/images/icons/blm_icon.png','Just signed up for this professional development course! Supporting a black entrepreneur!','blm','post9',3,'fgarcia')
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
insert into actions (cause,title,points,main_description,icon,mainUrl,reading,repeatable,additionalInfo)
VALUES
    ('blm',
    'Support a Black-Owned Business',
    50,
    'Hungry? Need some retail therapy? Looking for something artisan? Support black-owned!',
    '/images/icons/blm_icon.png',
    'http://yelp.com',
    'https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',
    true,
    ''),
    ('blm','Support a Black Artist',50,'Buy some art!','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Support Organizations Supporting Black Life',50,'','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Share Black Organizations on Social Media',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('blm','Volunteer',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Support an Environmental Campaign',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Red-Meat-Free Week',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Purchase a Reusable Item',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Ride a Bike Instead of Drive (Three Times)',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Carpool',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Full Recycling Bin!',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('climate','Ride Public Transit Five Times',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    --('election','Vote Early',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Vote By Mail',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Attend a City/County Council Meeting',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Support a Political Organization',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Join a Political Organization',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Sign a Petition',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('election','Learn About Local Politics',5,'dstonem','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,''),
    ('usps','Return 10 Pieces of Junk Mail',20,'For every 10 pieces of mail you return, $5 is raised for the USPS. It is your choice to write anything (or nothing) on the forms you are returning.','/images/icons/blm_icon.png','http://yelp.com','https://www.vox.com/first-person/2020/5/28/21272380/black-mothers-grief-sadness-covid-19',true,'');

insert into action_resources (name,url,pic,description,action_id)
values 
    (
        'Find a Business Near You',
        'https://www.yelp.com/search?find_desc=Black+Owned+Businesses&find_loc=${city}%2C+${state}&ns=1',
        '/images/map.png',
        'Click the image to find black-owned businesses in your area!',
        1
    ),
    (
        'Apartment Therapy',
        'https://www.apartmenttherapy.com/shop-black-owned-businesses-36759922',
        '/images/apartment_therapy.jpg',
        'Accessorize your apartment in style with these black-owned businesses.',
        1
    ),
    (
        'Etsy',
        'https://www.etsy.com/featured/blackownedshops?utm_source=google&utm_medium=cpc&utm_term=black%20owned%20businesses_e&utm_campaign=Search_US_Nonbrand_GGL_Politics_Social-Justice_New_LT_Exact&utm_ag=Black-Owned%2BShops&utm_custom1=_k_CjwKCAjw4rf6BRAvEiwAn2Q76mS6nTnAPKlrpGPLc5l2kOVGQPkLPVmQycgadigvXAR6jWHJkvvAuhoCf7gQAvD_BwE_k_&utm_content=go_10221881501_102356872975_439825159817_aud-301856855998:kwd-312223407776_c_&utm_custom2=10221881501&gclid=CjwKCAjw4rf6BRAvEiwAn2Q76mS6nTnAPKlrpGPLc5l2kOVGQPkLPVmQycgadigvXAR6jWHJkvvAuhoCf7gQAvD_BwE',
        '/images/etsy.jpg',
        'Shop black artisans on Etsy.',
        1
    ),
    (
        'Black Owned Business Network',
        'https://www.blackownedbiz.com/directory/',
        '/images/blackbizowner.png',
        'Looking for more professional services? Explore one of the largest directories of black-owned businesses.',
        1
    ),
    (
        'Volunteer Match',
        --XXXXXXXXXX need to change on the frontend, plus these have different categories
        'https://www.volunteermatch.org/search?l=atlanta%2C+ga%2C+usa&cats=33',
        'https://upload.wikimedia.org/wikipedia/commons/e/ea/VolunteerMatch_official.png',
        'Find a volunteer opportunity near you, in any cause!',
        5 -- vulunteer
    ),
    (
        'One Week of Vegetarian Meals', -- red-meat-free week
        'https://www.thespruceeats.com/best-vegetarian-meal-delivery-services-4768445',
        'https://cdn.hellofresh.com/de/cms/raf/hellofresh-logo.png',
        'Order a week of vegetarian meals from any of these popular meal services!',
        7
    ),
    (
        'List of Reusable Items',
        'https://www.growingagreenfamily.com/50-reusable-goods-vs-disposable-goods/',
        'https://cdn.shopify.com/s/files/1/2237/5935/products/Bundle_Aqua_Set-1_25879b59-4530-4750-898e-0ea3542a68ec_1200x.jpg?v=1569076907',
        'Buy a reusable item and earn points!',
        8
    ),
    (
        'Bike Share Programs Near You',
        'https://www.google.com/search?q=bike+share+programs+near+me&rlz=1C5CHFA_enUS903US905&oq=bike+share+programs+near+&aqs=chrome.1.69i57j33l6.4462j0j4&sourceid=chrome&ie=UTF-8',
        'https://media.wired.com/photos/59328fcc5c4fbd732b5538f4/master/w_660,c_limit/bike-share-660.jpg',
        'Ride a bike three times, post your bike share receipt or (safely) take photos of you biking to work!',
        9
    )
