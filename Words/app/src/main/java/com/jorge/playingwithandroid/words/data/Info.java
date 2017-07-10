package com.jorge.playingwithandroid.words.data;

/**
 * Created by jorge.carlos.varela.de.la.barrera@ibm.com on 7/8/17.
 */

public class Info {

    private String id;
    private String name;
    private String imageUrl;
    private String info;


    public Info(String id, String name, String imageUrl, String info){
        setId(id);
        setImageUrl(imageUrl);
        setName(name);
        setInfo(info);
    }

    //SETTERS
    public void setId(String id){this.id = id;}
    public void setName(String name){this.name = name;}
    public void setImageUrl(String imageUrl){this.imageUrl = imageUrl;}
    public void setInfo(String info){this.info = info;}

    //GETTERS
    public String getID(){return id;}
    public String getName() {return name;}
    public String getImageUrl(){return imageUrl;}
    public String getInfo(){return info;}

}
