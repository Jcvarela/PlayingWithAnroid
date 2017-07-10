package com.jorge.playingwithandroid.words.other;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.jorge.playingwithandroid.words.R;
import com.jorge.playingwithandroid.words.data.Info;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;

/**
 * Created by jorge.carlos.varela.de.la.barrera@ibm.com on 7/8/17.
 */

public class InfoArrayAdapter extends ArrayAdapter<Info> {
    private final Context context;
    private ArrayList<Info> values;

    public InfoArrayAdapter(Context context, ArrayList<Info> values) {
        super(context, -1, values);
        this.context = context;
        this.values = values;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        View rowView = inflater.inflate(R.layout.data_box_main, parent, false);

        Info obj = values.get(position);

        //fill the information needed
        TextView textView = (TextView) rowView.findViewById(R.id.textView3);
        textView.setText(obj.getName());

        ImageView imageView = (ImageView) rowView.findViewById(R.id.firstImage);
        try {
            InputStream is = (InputStream) new URL(obj.getImageUrl()).getContent();
            Drawable d = Drawable.createFromStream(is, "src name");
            imageView.setBackground(d);
        } catch (Exception e) {
            e.printStackTrace();
            CharSequence text = "fail image load";
            int duration = Toast.LENGTH_SHORT;
            Toast toast = Toast.makeText(context, text, duration);
            toast.show();
        }

        return rowView;
    }
}
