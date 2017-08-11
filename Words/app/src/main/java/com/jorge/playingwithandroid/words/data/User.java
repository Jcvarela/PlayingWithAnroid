package com.jorge.playingwithandroid.words.data;

/**
 * Created by jorge.carlos.varela.de.la.barrera@ibm.com on 7/8/17.
 */

public class User {

    private String id;
    private String name;
    private String imageUrl;

    public User(String id, String name, String imageUrl){
        setId(id);
        setImageUrl(imageUrl);
        setName(name);
    }

    //SETTERS
    public void setId(String id){this.id = id;}
    public void setName(String name){this.name = name;}
    public void setImageUrl(String imageUrl){this.imageUrl = imageUrl;}

    //GETTERS
    public String getID(){return id;}
    public String getName() {return name;}
    public String getImageUrl(){return imageUrl;}

}

