import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import Subscriber from './subscriber.service';


export interface SubscriberService {
  addSubscriber(subscriber: CreateSubscriberDto): Promise<Subscriber>
  getAllSubscribers(params: {}): Promise<{ data: Subscriber[] }>

}
