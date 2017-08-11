package com.jorge.playingwithandroid.testingfunctions;


import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;

import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity {
    static ImageView view;
    String url = "https://www.hello.com/img_/hello_logo_hero.png";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        view =  (ImageView) findViewById(R.id.imageView);
        loadImageFromUrl(this,url,view.getDrawable());
    }

    public static void loadImageFromUrl(Context context, String url,Drawable drawable){

        Picasso.with(context).load(url)
                .error(drawable;//if error

    }


}
