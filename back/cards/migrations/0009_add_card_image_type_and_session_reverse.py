# Generated manually for card image, card_type, and session is_reversed

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0008_remove_card_card_type_remove_card_image_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='cards/images/', verbose_name='Изображение'),
        ),
        migrations.AddField(
            model_name='card',
            name='card_type',
            field=models.CharField(
                choices=[('basic', 'Обычная'), ('multiple_choice', 'Множественный выбор')],
                default='basic',
                max_length=20,
                verbose_name='Тип карточки',
            ),
        ),
        migrations.AddField(
            model_name='studysession',
            name='is_reversed',
            field=models.BooleanField(default=False, verbose_name='Реверс (ответ → вопрос)'),
        ),
    ]
