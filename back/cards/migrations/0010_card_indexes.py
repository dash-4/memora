from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0009_add_card_image_type_and_session_reverse'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='card',
            index=models.Index(fields=['next_review'], name='cards_card_next_re_ix'),
        ),
        migrations.AddIndex(
            model_name='card',
            index=models.Index(fields=['deck', 'next_review'], name='cards_card_deck_next_ix'),
        ),
    ]
