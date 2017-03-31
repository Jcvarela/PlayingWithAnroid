package com.example.jcvar.introapp;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        setRandomImage();
    }


    public void clickFUNCTION(View view) {

        //Get elements by id
        EditText username = (EditText) findViewById(R.id.usernameInput);
        String user = username.getText().toString();

        //print message to logcat
        printTologcat(user);

        //print message to android screen
        printToast(user);

        //switch images
        setRandomImage();
    }

    public void printTologcat(String username){
        //PRINT info to the the logcat (under android monitor), similar to System.out.println();
        //          use the search to simplify the output of the logcat (because it shows too much info)
        Log.i("Info", "Username: " + username);
    }

    public void printToast(String user){
        String print = (user.toLowerCase().contains("jorge")) ? "That's a cool username u got there" : "I don't like that username";

        //can print information to the android screen (like a pop up alert that goes away)
        //a long appearance or a short one
        Toast.makeText(MainActivity.this, print, Toast.LENGTH_LONG).show();
    }


    int[] img = {R.drawable.image0,R.drawable.image1,R.drawable.image2,R.drawable.image3,R.drawable.image4,R.drawable.image5,R.drawable.image6,R.drawable.image7,R.drawable.image8};
    public void setRandomImage(){
        int random = (int)(Math.random()*img.length);

        ImageView image = (ImageView) findViewById(R.id.imageView);

        image.setImageResource(img[random]);
    }

}
