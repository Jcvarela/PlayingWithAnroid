package com.jorge.playingwithandroid.words.data;

import java.util.ArrayList;

/**
 * Created by jorge.carlos.varela.de.la.barrera@ibm.com on 7/8/17.
 */

public class AllData {
       public User mainUser;
    public ArrayList<Info> infoArray;

    private static AllData data;
    private AllData(){
        mainUser = new User("11111111","Tigre","https://cdn.thinglink.me/api/image/759433354905911297/1240/10/scaletowidth");
        infoArray = new ArrayList<>();
        infoArray.add(new Info("a1","cow","https://pbs.twimg.com/profile_images/791067045991358464/yy_F__YU.jpg","a fully grown female animal of a domesticated breed of ox, used as a source of milk or beef."));
        infoArray.add(new Info("a2","emu", "https://static1.squarespace.com/static/56a1a14b05caa7ee9f26f47d/t/56ef948e27d4bd656a00c7a6/1458541716878/","a large flightless fast-running Australian bird resembling the ostrich, with shaggy gray or brown plumage, bare blue skin on the head and neck, and three-toed feet."));
        infoArray.add(new Info("a3","alligator","http://kids.nationalgeographic.com/content/dam/kids/photos/animals/Reptiles/A-G/american-alligator-jaws.ngsversion.1412350001396.jpg","either of two crocodilians of the genus Alligator, of the southeastern U.S. and E China, characterized by a broad snout."));
        infoArray.add(new Info("a4","Jordi","","owns me Mi Apa food"));
    }
    public static AllData getAllData(){
        if(data == null){
            data = new AllData();
        }
        return data;
    }

    public ArrayList<Info> getInfoArray() {return infoArray;}

}
